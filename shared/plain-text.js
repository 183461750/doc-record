/**
 * HTML → 纯文本的单一来源。
 *
 * 两个消费方共用本文件，避免同一规则各写一遍后漂移（代码审查发现项 M7）：
 *   - 浏览器端问答召回（`src/components/AiAsk.astro`）：Pagefind 的摘录与正文含少量标记；
 *   - 问答生成端（`cloudflare/ai-answer/src/index.js`）：拼接 prompt 前需要单行纯文本。
 *
 * 之所以是 `.js` 而不是 `.ts`：Worker 的最小用例用 `node` 直接运行（不做转译），而
 * `node`、Vite 与 wrangler 都能导入本文件；类型由 JSDoc 提供，并由 Worker 的
 * `tsc --checkJs --strict`（`pnpm check:worker`）强制执行。
 */

/** 命名实体表：Pagefind 的正文与摘录会把这些原样带出。 */
const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/**
 * 去掉 HTML 标签，单次线性扫描。
 *
 * 不写成 `/<[^>]*>/g`：CodeQL 的 js/polynomial-redos 指出，形如 `<<<<…` 的输入会让
 * 每个 `<` 都把后续字符扫一遍再回溯，复杂度是多项式的；而问答链路的文本来自公开端点、
 * 属不可信输入（请求体上限 64 KB）。线性扫描在极限输入下也只走一遍。
 *
 * 与正则版的行为一致：未闭合的 `<` 之后的内容按普通文本保留，标签本身替换为空格。
 *
 * @param {string} value
 * @returns {string}
 */
export function stripTags(value) {
  let out = '';
  let index = 0;

  while (index < value.length) {
    const open = value.indexOf('<', index);
    if (open === -1) {
      out += value.slice(index);
      break;
    }

    out += value.slice(index, open);

    const close = value.indexOf('>', open + 1);
    if (close === -1) {
      out += value.slice(open);
      break;
    }

    out += ' ';
    index = close + 1;
  }

  return out;
}

/**
 * 解码常见命名实体与数字实体，未知实体原样保留。
 *
 * @param {string} value
 * @returns {string}
 */
export function decodeEntities(value) {
  const fromCode = (/** @type {number} */ code) =>
    Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';

  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => fromCode(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => fromCode(Number(dec)))
    .replace(
      /&([a-z]+);/gi,
      (match, name) =>
        NAMED_ENTITIES[/** @type {keyof typeof NAMED_ENTITIES} */ (name.toLowerCase())] ?? match,
    );
}

/**
 * HTML（含标签与实体）→ 单行纯文本。
 *
 * 按「剥离 → 解码 → 再剥离」处理：顺序不能反 —— 先解码会让 `&lt;script&gt;` 变成真正的
 * 标签从而绕过剥离；解完再剥一次，则被编码的标记不会留下。仅解码一层，双重编码
 * （`&amp;lt;`）仍按字面保留，属已知边界。
 *
 * @param {unknown} value
 * @returns {string}
 */
export function toPlainText(value) {
  return stripTags(decodeEntities(stripTags(String(value ?? ''))))
    .replace(/\s+/g, ' ')
    .trim();
}
