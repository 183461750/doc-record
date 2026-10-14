/**
 * 站点级常量的单一来源。
 *
 * `astro.config.mjs`、根路径跳转存根（`src/pages/index.astro`）与分类索引页
 * （`src/lib/category.ts`）都要用到这些取值。此前默认语言标识在配置与分类页里
 * 各写一份，新增语言或改站点描述时容易漂移（见
 * `adr/2026-10-14-代码审查发现项处置.md` 的 L5）。
 */

/** 默认语言标识，同时是 `src/content/docs/` 下的语言目录名与 URL 前缀。 */
export const DEFAULT_LOCALE = 'zh-cn';

/** 站点标题与描述：导航、页面 `<title>` 与跳转存根的 og 元信息共用。 */
export const SITE_TITLE = 'Doc Record';
export const SITE_DESCRIPTION = '各类技术文档与解决方案收集';
