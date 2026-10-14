import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * 供 AI 检索使用的站点地图，只收录默认语言页面。
 *
 * 站点已按语言目录组织，条目 id 自带语言前缀（`zh-cn/docker/...`），可直接拼成 URL。
 * 未列入 `locales` 的语言不会生成回退副本，因此无需在此过滤重复内容。
 */

/** `<loc>` 的内容模型是 anyURI，`&` 等字符必须转义，否则整份 XML 无法解析。 */
const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

const escapeXml = (value: string) => value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char]!);

/**
 * 条目 id 转页面地址。`index` 结尾的是目录索引，Starlight 的地址不带末段
 * （`zh-cn/index` → `/zh-cn/`），否则会产出 404 条目。
 */
function pagePath(id: string): string {
  if (!id) return '/';
  const withoutIndex = id.endsWith('/index') ? id.slice(0, -'/index'.length) : id;
  return `/${withoutIndex}/`;
}

/** 测试夹具目录不进入 AI 检索面（页面本身照常构建，e2e 依赖它们）。 */
const EXCLUDED_PREFIX = 'zh-cn/test/';

export const GET: APIRoute = async ({ site }) => {
  const entries = await getCollection('docs');
  const base = (site ?? new URL('https://doc-record.iuin888vip.icu')).toString().replace(/\/$/, '');

  const urls = entries
    .filter((entry) => !entry.id.startsWith(EXCLUDED_PREFIX))
    .map((entry) => `  <url><loc>${escapeXml(base + pagePath(entry.id))}</loc></url>`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
