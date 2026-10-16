/**
 * Markdown → 纯文本的单一来源（标题规则）。
 *
 * 两个消费方共用本文件（代码审查发现项 M6）：
 *   - 构建期 loader（`src/content.config.ts`）：未声明 front matter 时由正文首个 H1 推导页面标题；
 *   - 构建期 remark 插件（`src/plugins/remark-strip-duplicate-h1.ts`）：判断正文 H1 是否与页面标题重复。
 *
 * 合并的动因不是「有一处正在出错」，而是两条规则各自演化会让它们悄悄分叉：
 * 插件此前走 mdast（内联 HTML 节点直接丢弃），loader 走正则（HTML 原样保留），
 * 同一篇文档在两条路径下会得到不同的「标题纯文本」。现在两处都以本文件的
 * `headingTextFromMarkdown()` 为准 —— 插件优先用原始 Markdown 求值，与 loader 同源。
 *
 * 只识别 ATX 一级标题，与本站文档库的实际写法一致（无 setext 用法）；围栏代码块内的
 * `#` 注释不参与判定。
 */

import { toPlainText } from './plain-text.js';

/** ATX 一级标题（行首 `#` + 至少一个空格）。 */
const ATX_H1 = /^#[ \t]+(.+?)[ \t]*$/;

/** 围栏代码块标记（CommonMark：行首最多三个空格 + 至少三个反引号或波浪号）。 */
const CODE_FENCE = /^ {0,3}(`{3,}|~{3,})/;

/**
 * 行内 Markdown 标记 → 文本，并去掉 HTML 与实体。
 *
 * @param {string} value
 * @returns {string}
 */
export function stripInlineMarkdown(value) {
  return toPlainText(
    value
      // 负向后顾跳过转义：`\*` 是字面星号，不构成强调标记。此前正则不看转义，
      // 标题「左 \* 与 \* 右」会被误判成强调而丢掉中间的字符，与 mdast 的解析
      // 结果（字面保留）不一致，进而让「正文 H1 与页面标题是否重复」判错。
      .replace(/(?<!\\)`([^`]*)`/g, '$1')
      .replace(/(?<!\\)\*\*([^*]*)\*\*/g, '$1')
      .replace(/(?<!\\)\*([^*]*)\*/g, '$1')
      .replace(/(?<!\\)__([^_]*)__/g, '$1')
      .replace(/(?<!\\)\[([^\]]*)\]\([^)]*\)/g, '$1')
      // 还原 CommonMark 的可转义字符（`\*` → `*`）
      .replace(/\\([\\`*_[\]()~#>+\-.!])/g, '$1'),
  );
}

/**
 * 取正文首个一级标题的纯文本，跳过围栏代码块。
 *
 * 行首最多三个空格的至少三个反引号或波浪号开栅栏；同类、不短于起始标记、其后只有
 * 空白的栅栏闭合；缩进四格的行属于缩进代码块，同样不参与判定。
 *
 * @param {string} markdown
 * @returns {string | undefined}
 */
export function firstHeadingText(markdown) {
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
    if (heading) return stripInlineMarkdown(heading[1]);
  }

  return undefined;
}
