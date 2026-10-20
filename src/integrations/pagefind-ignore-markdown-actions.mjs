/**
 * 把标题区的 MarkdownActions（「Copy page / Open in ChatGPT…」）从 Pagefind 索引里摘掉。
 *
 * 背景：Starlight 用 `data-pagefind-body` 限定索引范围，而主题 `starlight-theme-black`
 * 的 PageTitle 把 MarkdownActions 渲染在这个范围内 —— 于是每页索引正文都以
 * 「Copy page Open in ChatGPT…」开头：污染召回（英文词会命中这些 UI 文案），
 * 也会让问答的「来源摘录」里出现按钮文字。实测 `data.content` 确实以这串文字开头。
 *
 * 为什么不用官方配置：Starlight 的 `pagefind` 配置只暴露 indexWeight / ranking /
 * mergeIndex，没有 excludeSelectors；而主题的 PageTitle 依赖包内私有模块，fork 不划算。
 * 因此改为在构建产物上给该元素补一个 `data-pagefind-ignore`（Pagefind 原生支持的属性）。
 *
 * 时序：本集成必须在 starlight() 之前声明 —— Astro 按声明顺序执行 `build:done` 钩子，
 * 而 Starlight 的 Pagefind 索引也在同一钩子里跑。
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** 需要从索引里摘掉的两类纯界面文本。 */
const REPLACEMENTS = [
  // 标题区的「Copy page / Open in ChatGPT…」按钮
  ['class="markdown-actions ', 'data-pagefind-ignore class="markdown-actions '],
  // 代码块的无障碍说明「终端窗口」：给读屏用户的话，不是正文；每个代码块都带一条，
  // 出现在召回片段的正文里会持续干扰模型
  ['<span class="sr-only">', '<span data-pagefind-ignore class="sr-only">'],
];

/** @param {string} dir */
async function* walkHtml(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walkHtml(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}

/** @returns {import('astro').AstroIntegration} */
export function pagefindIgnoreMarkdownActions() {
  return {
    name: 'doc-record:pagefind-ignore-markdown-actions',
    hooks: {
      // @ts-expect-error Astro 的钩子参数类型未在各版本间稳定导出
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        let patched = 0;
        for await (const file of walkHtml(root)) {
          let html = await readFile(file, 'utf8');
          let touched = false;
          for (const [from, to] of REPLACEMENTS) {
            if (!html.includes(from)) continue;
            html = html.split(from).join(to);
            touched = true;
          }
          if (!touched) continue;
          await writeFile(file, html, 'utf8');
          patched += 1;
        }
        logger.info(`已把界面文本排除出 Pagefind 索引：${patched} 个页面`);
      },
    },
  };
}
