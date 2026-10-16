/**
 * 删除与页面标题重复的正文档首个一级标题。
 *
 * 页面标题区的文案有两个来源：front matter 的 `title`，缺失时由
 * docsLoader 回退到正文首个一级标题（见 src/content.config.ts）。
 * 正文中的一级标题同时也会原样渲染，因此只要文档以一级标题开头，
 * 渲染结果就会出现两个相同的标题。
 *
 * 文档由多人维护，无法要求每篇都声明 front matter，因此在构建期
 * 统一处理：首个内容块是一级标题且与页面标题一致（或无 title、
 * 标题正是由它推导而来）时移除该标题节点。
 *
 * 判定为「首个内容块」时跳过 front matter、导入导出语句、HTML 注释
 * 与空白文本，避免 mdx 的 import 语句影响判断。
 */

import type { Root, RootContent } from 'mdast';

import { firstHeadingText } from '../../shared/markdown-text.js';

/** 取值时只保留行内文本，忽略强调、行内代码等标记。 */
function nodeText(node: RootContent): string {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if ('children' in node) return node.children.map((child) => nodeText(child as RootContent)).join('');
  return '';
}

/** 不参与「首个内容块」判定的节点类型。 */
const SKIPPED_TYPES = new Set([
  'yaml',
  'toml',
  'mdxjsEsm', // import / export
  'mdxJsxFlowElement',
  'html',
  'comment',
  'definition',
  'footnoteDefinition',
]);

export function remarkStripDuplicateH1() {
  return (tree: Root, file: any) => {
    const frontmatter: Record<string, unknown> = file?.data?.astro?.frontmatter ?? {};
    const children = tree.children;

    let index = -1;
    for (let position = 0; position < children.length; position += 1) {
      const node = children[position]!;
      if (SKIPPED_TYPES.has(node.type)) continue;
      if (node.type === 'text' && !node.value.trim()) continue;
      if (node.type === 'heading' && node.depth === 1) index = position;
      break;
    }
    if (index === -1) return;

    const heading = children[index]!;
    // 与 loader 同源：优先按原始 Markdown 求标题纯文本（两处规则必须一致，见
    // shared/markdown-text.js）。仅当原始 Markdown 里取不到 ATX 一级标题
    // （例如 setext 写法）时才回退到 mdast 文本。
    const text =
      firstHeadingText(String(file?.value ?? '')) ?? nodeText(heading).trim();
    const title = typeof frontmatter.title === 'string' ? frontmatter.title.trim() : undefined;

    // 标题与页面标题不一致时视为作者有意保留，不删除
    if (title && title !== text) return;

    children.splice(index, 1);
  };
}

export default remarkStripDuplicateH1;
