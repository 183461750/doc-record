/**
 * 分类索引页（src/pages/zh-cn/category/[...path].astro）的共享常量。
 *
 * Astro 会把 `getStaticPaths` 抽离到独立 chunk 执行，不能引用页面模块
 * 顶层定义的变量，因此这类常量放在独立模块中由两处共同导入。
 */

/** 内容所在（也是 URL 前缀）的默认语言目录。 */
export const DOCS_LOCALE = 'zh-cn';

/** 顶层目录的展示名，其余层级沿用目录名。 */
export const TOP_LEVEL_TITLES: Record<string, string> = {
  ai: 'AI',
  blog: '博客',
  books: '读书笔记',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  lang: '编程语言',
  materiel: '资料',
  middleware: '中间件',
  network: '网络',
  os: '操作系统',
  test: '测试',
  todos: '待办',
  tools: '工具',
};
