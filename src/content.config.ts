import { readFile } from 'node:fs/promises';

import { defineCollection } from 'astro:content';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { blogSchema } from 'starlight-blog/schema';

/** 一级标题行（ATX 写法，行首不留缩进）。 */
const ATX_H1 = /^#[ \t]+(.+?)[ \t]*$/;

/** 围栏代码块标记（CommonMark：行首最多三个空格 + 至少三个反引号或波浪号）。 */
const CODE_FENCE = /^ {0,3}(`{3,}|~{3,})/;

/**
 * 取正文首个一级标题，跳过围栏代码块。
 *
 * 不能直接对全文做 `^# ` 的多行匹配：代码块里的 `#` 注释（shell、YAML、Dockerfile）
 * 同样以 `#` 开头，会被误当成标题 —— 站内曾有 19 篇未声明 title 的文档因此把
 * 代码注释（如「重启服务」）渲染成页面标题。这里按 CommonMark 走一遍围栏：
 * 行首最多三个空格的至少三个反引号或波浪号开栅栏；同类、不短于起始标记、其后只有
 * 空白的栅栏闭合；缩进四格的行属于缩进代码块，同样不参与判定。
 * 只识别 ATX 一级标题，与本文档库的实际写法一致（无 setext 用法）。
 */
function firstHeading(markdown: string): string | undefined {
  let fence = '';

  for (const line of markdown.split('\n')) {
    const marker = CODE_FENCE.exec(line);

    if (fence) {
      // 闭合栅栏不带信息串，长度不得短于起始标记，且同类（反引号不闭合波浪号）
      const closes =
        marker !== null &&
        marker[1][0] === fence[0] &&
        marker[1].length >= fence.length &&
        line.slice(marker[0].length).trim() === '';
      if (closes) fence = '';
      continue;
    }

    if (marker) {
      fence = marker[1];
      continue;
    }

    const heading = ATX_H1.exec(line);
    if (heading) return heading[1];
  }

  return undefined;
}

/** 去除行内 Markdown 标记，避免标题中残留 `**` 之类的符号。 */
function stripInlineMarkdown(value: string): string {
  return value
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim();
}

const base = docsLoader();

/**
 * 博客条目的路径位置：`<语言目录>/blog/`。前缀与 starlight-blog 的默认
 * `prefix` 取值（`blog`）一致，未在 `astro.config.mjs` 中传 `prefix`。
 */
const BLOG_DIRECTORY = 'blog';

/**
 * entry.id 形如 `zh-cn/blog/docker/...`：首段是语言目录，其后才是内容路径。
 * 语言目录名与插件前缀都与本函数耦合，任一处改动需同步；e2e 用例会兜住该耦合。
 */
function isBlogEntry(id: string): boolean {
  return id.split('/')[1] === BLOG_DIRECTORY;
}

/**
 * loader 阶段的 `entry.data` 是未经过 schema 校验的 front matter，字段类型为
 * `unknown`；`sidebar` 是需要合并而非整体覆盖的对象字段，故先收敛为对象。
 */
function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

/**
 * 包装 Starlight 的 docsLoader，统一补齐作者无需声明的元数据。
 *
 * 1. `title`：未声明时按首个一级标题推导，无一级标题时回退为文件名。
 *    目的：Markdown 保持原生态，作者无需为了通过构建而写 front matter。
 *    title 仍是可选的标准字段，显式声明时优先使用。
 * 2. `sidebar.hidden`：博客文章寄居在 docs 集合，是 starlight-blog 的强制约定
 *    （插件复用 docs 集合并通过 `blogSchema` 扩展字段）。若不加处理，它们会同时
 *    污染文档侧边栏与 Starlight 的文档分页：分页按 docs 侧边栏的目录序取
 *    「当前项 ±1」，于是博客文章页会同时出现两套上下篇 —— 插件在正文末尾按发布日期
 *    渲染的卡片，与这里按目录字母序算出的「上一篇/下一篇」，两者顺序互相冲突。
 *    博客有自己的侧边栏、日期与标签，不属于文档信息架构：插件已为文档侧边栏注入
 *    唯一的 `Blog` 入口（`sl-blog-mobile-link`），故这里把博客条目统一摘除。
 *    摘除后文档分页在博客页自然为空（找不到当前项 → prev/next 均为 undefined）。
 *
 * @see adr/2026-10-13-博客条目退出文档侧边栏.md
 */
const normalizingDocsLoader: Loader = {
  name: 'doc-record-docs-loader',
  async load(context) {
    await base.load(context);

    for (const entry of context.store.values()) {
      if (!entry.data?.title) {
        let title = '';
        if (entry.filePath) {
          try {
            const raw = await readFile(new URL(entry.filePath, context.config.root), 'utf8');
            const heading = firstHeading(raw);
            if (heading) title = stripInlineMarkdown(heading);
          } catch {
            title = '';
          }
        }

        // 无一级标题时回退为文件名，与主流静态站点生成器的行为一致
        if (!title) title = entry.id.split('/').pop() ?? entry.id;

        entry.data = { ...entry.data, title };
      }

      if (isBlogEntry(entry.id)) {
        // 保留作者显式声明的其他 sidebar 字段（label、order 等）
        entry.data = {
          ...entry.data,
          sidebar: { ...asRecord(entry.data?.sidebar), hidden: true },
        };
      }
    }
  },
};

export const collections = {
  docs: defineCollection({
    loader: normalizingDocsLoader,
    schema: docsSchema({
      // title 必须声明为可选：Astro 在 docsLoader 内部（glob loader 的 getEntryData）
      // 就按 schema 校验 front matter，早于本站 loader 的标题补齐，声明为必填会让
      // 所有未写 front matter 的文档在构建期校验失败。下游页面取值时按可选处理。
      extend: (context) =>
        blogSchema(context).extend({ title: z.string().optional() }),
    }),
  }),
  i18n: defineCollection({
    loader: i18nLoader(),
    schema: i18nSchema({
      // 全站问答悬浮入口与配色切换器的文案，随界面语言切换
      extend: z.object({
        'aiAsk.label': z.string(),
        'aiAsk.title': z.string(),
        'aiAsk.hint': z.string(),
        'aiAsk.close': z.string(),
        'aiAsk.placeholder': z.string(),
        'aiAsk.submit': z.string(),
        'aiAsk.pending': z.string(),
        'aiAsk.empty': z.string(),
        'aiAsk.failed': z.string(),
        'aiAsk.sources': z.string(),
        'palette.label': z.string(),
        'palette.default': z.string(),
      }),
    }),
  }),
};
