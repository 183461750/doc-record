/**
 * 分类索引页（src/pages/zh-cn/category/[...path].astro）的共享常量。
 *
 * Astro 会把 `getStaticPaths` 抽离到独立 chunk 执行，不能引用页面模块
 * 顶层定义的变量，因此这类常量放在独立模块中由两处共同导入。
 */

// 默认语言标识统一由 src/lib/site.ts 提供：astro.config.mjs、根路径跳转存根与
// 本文件必须一致，否则分类页路由前缀会与站点实际布局错位。
export { DEFAULT_LOCALE as DOCS_LOCALE } from './site';

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
