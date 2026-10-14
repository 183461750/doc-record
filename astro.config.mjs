import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';
import starlightLlmsTxt from 'starlight-llms-txt';
import starlightThemeBlack from 'starlight-theme-black';

// 正文首个一级标题与页面标题重复时，在构建期移除该标题节点。
// 文档由多人维护，无法要求每篇都声明 front matter，故在渲染管线兜底，
// 详见 src/plugins/remark-strip-duplicate-h1.ts。
import { remarkStripDuplicateH1 } from './src/plugins/remark-strip-duplicate-h1.ts';
// Astro 7 起插件通过 unified 处理器传入，markdown.remarkPlugins 已弃用
import { unified } from '@astrojs/markdown-remark';

// 全部内容位于默认语言目录下，llms.txt 分卷均以该前缀为基准。
const DEFAULT_LOCALE = 'zh-cn';
const inDefaultLocale = (path) => `${DEFAULT_LOCALE}/${path}`;

// llms.txt 分卷：完整版约 769 KB，单次取用会占满上下文，
// 按分类拆分后 AI 可只读取相关分卷，完整版作为回退。
const llmsTxtOptions = {
  details:
    '内容以 CommonMark 编写，代码块用围栏语法标注语言。上下文有限时优先取用下列分类分卷。' +
    '全文采用 MIT 许可证，可自由引用与再分发，引用时请注明来源与原文链接。',
  customSets: [
    { label: 'Docker', description: '容器构建、镜像、Compose 与开发环境', paths: [inDefaultLocale('docker/**')] },
    { label: 'Kubernetes', description: '集群部署、运维与问题排查', paths: [inDefaultLocale('kubernetes/**')] },
    {
      label: 'Operating System',
      description: 'Linux、Windows 等系统配置',
      paths: [inDefaultLocale('os/**')],
    },
    {
      label: 'Middleware',
      description: '数据库、消息队列等中间件',
      paths: [inDefaultLocale('middleware/**')],
    },
    {
      label: 'Programming Languages',
      description: '各类编程语言的使用与构建配置',
      paths: [inDefaultLocale('lang/**')],
    },
    { label: 'Network', description: '网络配置、代理与穿透', paths: [inDefaultLocale('network/**')] },
    { label: 'Tools', description: '开发工具与发布脚本', paths: [inDefaultLocale('tools/**')] },
    { label: 'AI', description: 'AI 相关技术、MCP 与应用', paths: [inDefaultLocale('ai/**')] },
    { label: 'Blog', description: '实践记录与问题复盘', paths: [inDefaultLocale('blog/**')] },
    {
      label: 'Notes',
      description: '技术资料、读书笔记与待办',
      paths: [inDefaultLocale('materiel/**'), inDefaultLocale('books/**')],
    },
    { label: 'Todos', description: '待办与计划', paths: [inDefaultLocale('todos/**')] },
  ],
  // 测试夹具不进入面向 AI 的精简版（页面照常构建，e2e 依赖它们）；
  // sitemap-ai.xml 侧另有排除，见 src/pages/sitemap-ai.xml.ts。
  exclude: [inDefaultLocale('test/**')],
};

export default defineConfig({
  site: 'https://doc-record.iuin888vip.icu',

  markdown: {
    processor: unified({ remarkPlugins: [remarkStripDuplicateH1] }),
  },

  // 默认语言带前缀后框架不再生成站点根索引，此处补一条指向默认语言首页。
  // 迁移前的 URL 不做逐条映射：新旧地址的兼容层会随内容演进而持续腐化，
  // 已收录链接交由搜索引擎按 canonical 与新站点地图重新收敛。
  redirects: {
    '/': `/${DEFAULT_LOCALE}/`,
  },

  integrations: [
    starlight({
      title: 'Doc Record',
      description: '各类技术文档与解决方案收集',
      favicon: '/img/favicon.ico',
      // 语言目录即 locale 键，有两种取值约束：
      //   1. 键名必须与 src/content/docs/ 下的目录名同为小写。Astro 会把内容集合的
      //      entry.id 整体小写化，Starlight 用 entry.id.startsWith(`${locale}/`) 判定归属，
      //      键名含大写字母时判定失败、页面不会被生成。
      //   2. 只声明实际存在译文目录的语言。Starlight 会为已声明但无译文的语言复制一份
      //      源语言页面作为回退，产生 /en /ja /zh-tw 三份正文完全相同的副本。
      // 译文目录就绪后，在此追加对应条目即可，无需改动内容结构。
      defaultLocale: DEFAULT_LOCALE,
      locales: {
        [DEFAULT_LOCALE]: { label: '中文', lang: 'zh-CN' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/iuin8/doc-record' },
        // starlight-blog 会自动补一个 RSS 图标，但它按 `site + base + 前缀`
        // 拼接地址，不含默认语言的路径前缀，本站 defaultLocale 也带前缀，
        // 拼出的地址是 404。显式声明正确地址：插件检测到已有 rss 图标后
        // 不再注入自己的那条。
        { icon: 'rss', label: 'RSS', href: '/zh-cn/blog/rss.xml' },
      ],
      // Starlight 会用条目的 filePath（相对仓库根目录）拼接该前缀，因此这里指向仓库根目录
      editLink: {
        baseUrl: 'https://github.com/iuin8/doc-record/edit/main/',
      },
      // 标题区附带「复制 Markdown / 用 AI 打开」操作，并按需加载 Mermaid。
      // 全站问答检索的是全站索引，不针对当前文档，故不放在标题区，
      // 改由 PageFrame 挂一个悬浮入口，任意页面都可发起提问。
      // ThemeSelect 旁挂出配色切换器，见 src/styles/palettes.css。
      //
      // starlight-theme-black 会覆盖 Head / Hero / PageTitle / ThemeSelect
      // 等组件；检测到已有覆盖时它会跳过并告警，此时需在自己的覆盖里手动
      // 渲染 `starlight-theme-black/overrides/<X>.astro`，已在对应组件中处理。
      components: {
        PageTitle: './src/components/PageTitle.astro',
        Head: './src/components/Head.astro',
        PageFrame: './src/components/PageFrame.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      customCss: ['./src/styles/palettes.css', './src/styles/black-layout.css'],
      // 必须传配置对象：插件对参数做 zod 校验，不传会报 expected object。
      // 标题区的 MarkdownActions 默认开启。
      // 侧边栏分组用折叠交互（useDropdowns）：本站目录层级最深达五层，
      // Black 默认全部平铺展开，长标题在窄侧边栏里会相互叠压。
      plugins: [
        starlightBlog(),
        starlightLlmsTxt(llmsTxtOptions),
        starlightThemeBlack({ sidebar: { useDropdowns: true } }),
      ],
    }),
  ],
});
