/**
 * 问答的召回层：查询 → 片段。
 *
 * 抽成独立模块的动因（生产级与通用化）：
 *   - 面板只负责交互与流式渲染，召回可以独立评测（`tests/recall/` 的金标准用例直接驱动面板、
 *     断言召回结果，见 adr/2026-10-19-AI-问答召回层与质量门禁.md）；
 *   - Pagefind 由调用方注入，替换检索实现（例如语料变大后换向量检索）不影响调用方。
 *
 * 纯 JS + JSDoc：node（评测/测试）、Vite（站点打包）都能直接导入。
 *
 * 已测量、未采纳的候选改进（2026-10-19，基线 93.3%，见 tests/recall/）：
 *   - 按「标题命中 + 最佳窗口覆盖」重排候选：金标准命中率无变化；
 *   - 候选池放大一倍（取 12 个再重排）：同样无变化，且每问多取 6 个 fragment。
 * 剩余唯一未命中是**词面不匹配**（中文提问「安装」对应页面几乎只有英文 `install_k8s`
 * 与命令），靠调排序无法解决；要动就得做查询扩展/同义词，属于另一个量级的改动。
 * 注意这里与 `shared/plain-text.js` 不同 —— 只有浏览器端导入，没有 `--checkJs --strict` 的
 * 静态检查，正确性由金标准评测兜底。
 *
 * @typedef {object} RecallHit
 * @property {string} url 绝对地址
 * @property {string} name 页面标题
 * @property {string} description 摘录（已去标记）
 *
 * @typedef {object} RecallContext
 * @property {string} url 绝对地址
 * @property {string} title 页面标题
 * @property {string} text 交给生成端的片段正文
 *
 * @typedef {object} PagefindResultData
 * @property {string} url
 * @property {string} [content]
 * @property {string} [excerpt]
 * @property {{ title?: string }} [meta]
 *
 * @typedef {object} PagefindHit
 * @property {string} id 多次检索之间用于结果融合
 * @property {() => Promise<PagefindResultData>} data
 *
 * @typedef {object} PagefindModule Pagefind 模块（`recall` 假定调用方已 `init()`）
 * @property {() => Promise<void>} init
 * @property {(query: string) => Promise<{ results: PagefindHit[] }>} search
 */

import { toPlainText } from './plain-text.js';

/** 交给生成端的片段数量上限；生成端 `MAX_CONTEXTS` 取同一数值的硬上限。 */
export const MAX_CONTEXTS = 6;


/** 单个片段正文的字符预算；生成端按 `MAX_CONTEXT_CHARS` 再截一次。 */
const WINDOW_SIZE = 1500;

/** 窗口滑动步长。 */
const WINDOW_STEP = 500;

/** 中文虚词与疑问词。长句检索时剔除，避免高频虚词占掉匹配名额。 */
const STOP_TERMS = new Set([
  '的', '了', '是', '吗', '呢', '啊', '吧', '我', '你', '它', '这', '那',
  '有', '在', '和', '与', '或', '就', '也', '很', '到', '要', '会', '着',
  '被', '把', '给', '对', '个', '们', '请', '问', '怎么', '怎样', '如何',
  '什么', '哪些', '哪个', '为什么', '可以', '能否', '有没有', '多少',
]);

/**
 * 浏览器原生中文分词器；不支持时返回 null，调用方退回按空白切分。
 *
 * @returns {{ segment(input: string): Iterable<{ segment: string }> } | null}
 */
function createSegmenter() {
  const ctor = /** @type {any} */ (Intl).Segmenter;
  return ctor ? new ctor('zh', { granularity: 'word' }) : null;
}

/**
 * 单字一律剔除：中文单字由 `一-鿿` 判定，拉丁字母与数字单字由末位规则判定。
 * 拉丁单字必须剔除 —— Pagefind 对单字母有命中，`qqqzzzxxy` 被切成 `q`/`z`/`x`/`y`
 * 后各自都能召回，融合结果全是噪声。
 *
 * @param {string} term
 * @returns {boolean}
 */
function isSearchableTerm(term) {
  if (term.length === 0 || STOP_TERMS.has(term)) return false;
  if (/^[一-鿿]$/.test(term)) return false;
  return !/^[a-z0-9]$/i.test(term);
}

/**
 * 把长句拆成可独立检索的词，剔除虚词与单字。
 *
 * @param {string} query
 * @returns {string[]}
 */
export function splitTerms(query) {
  const segmenter = createSegmenter();
  const parts = segmenter
    ? [...segmenter.segment(query)].map((item) => item.segment)
    : query.split(/\s+/);
  return [...new Set(parts)].map((term) => term.trim()).filter(isSearchableTerm);
}

/**
 * 多词分别检索后融合排名（RRF）：被越多词命中、且在各自结果中越靠前的片段排得越前。
 * 不同查询的分数不可直接比较，故只用名次。
 *
 * @param {string[][]} lists
 * @returns {string[]}
 */
export function fuseRankings(lists) {
  /** @type {Map<string, number>} */
  const scores = new Map();
  for (const list of lists) {
    list.forEach((id, index) => {
      scores.set(id, (scores.get(id) ?? 0) + 1 / (60 + index + 1));
    });
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

/**
 * 取覆盖查询词最多的窗口作为片段。
 *
 * 页面正文常达数千字符，而生成端只接收前 1500 字符。命中位置靠后时直接取开头
 * 会把相关内容整个切掉：nsenter 页正文 3062 字符，「持久化」位于第 2822 位，
 * 取开头导致模型只能回答「未在文档中找到相关内容」。
 *
 * @param {string} text
 * @param {string[]} terms
 * @returns {string}
 */
export function bestWindow(text, terms) {
  if (text.length <= WINDOW_SIZE || terms.length === 0) return text.slice(0, WINDOW_SIZE);
  const last = Math.max(0, text.length - WINDOW_SIZE);

  /**
   * @param {number} start
   * @returns {{ window: string, score: number }}
   */
  const scoreOf = (start) => {
    const window = text.slice(start, start + WINDOW_SIZE);
    let score = 0;
    for (const term of terms) {
      if (window.toLowerCase().includes(term.toLowerCase())) score += 1;
    }
    return { window, score };
  };

  let best = text.slice(0, WINDOW_SIZE);
  let bestScore = -1;

  // 起点上界为 last：落到末尾之外的起点会切出短于 WINDOW_SIZE 的窗口 ——
  // 既少了上下文，也可能因为「短窗口同样命中」被评为最佳。
  for (let start = 0; start <= last; start += WINDOW_STEP) {
    const { window, score } = scoreOf(start);
    if (score > bestScore) {
      bestScore = score;
      best = window;
    }
  }

  // 正文结尾常是结论或关键配置，而步长网格可能刚好错过它，补一个末尾对齐的窗口
  if (last % WINDOW_STEP !== 0) {
    const { window, score } = scoreOf(last);
    if (score > bestScore) best = window;
  }

  return best;
}

/**
 * 召回：把查询变成结果列表与交给生成端的片段。
 *
 * @param {PagefindModule} pagefind 已 init 的 Pagefind 模块
 * @param {string} query
 * @param {{ origin: string, limit?: number }} options `origin` 用于把页面路径补成绝对地址
 * @returns {Promise<{ hits: RecallHit[], contexts: RecallContext[] }>}
 */
export async function recall(pagefind, query, options) {
  const limit = options.limit ?? MAX_CONTEXTS;
  const terms = splitTerms(query);

  /** @type {PagefindHit[]} */
  let found = (await pagefind.search(query)).results.slice(0, limit);

  // Pagefind 对多个词要求同时命中同一文档，因此长句里只要有一个词与文档无关，
  // 结果就是 0。实测「nsenter 的改动是持久化的吗」为 0，而拆出的
  // 「nsenter」「持久」分别有 3 条与 4 条命中。故整句无结果时改为按词分别检索，再融合排名。
  if (found.length === 0 && terms.length > 0) {
    /** @type {string[][]} */
    const lists = [];
    /** @type {Map<string, PagefindHit>} */
    const pool = new Map();
    for (const term of terms) {
      const search = await pagefind.search(term);
      lists.push(search.results.map((item) => item.id));
      for (const item of search.results) {
        if (!pool.has(item.id)) pool.set(item.id, item);
      }
    }
    found = fuseRankings(lists)
      .slice(0, limit)
      .map((id) => pool.get(id))
      .filter((item) => item !== undefined);
  }

  const picked = await Promise.all(found.map((result) => result.data()));
  const windowTerms = terms.length > 0 ? terms : [query];

  /** @type {RecallHit[]} */
  const hits = [];
  /** @type {RecallContext[]} */
  const contexts = [];
  for (const item of picked) {
    const url = new URL(item.url, options.origin).href;
    const title = item.meta?.title ?? item.url;
    hits.push({ url, name: title, description: toPlainText(item.excerpt ?? '') });
    contexts.push({ url, title, text: bestWindow(toPlainText(item.content ?? ''), windowTerms) });
  }
  return { hits, contexts };
}
