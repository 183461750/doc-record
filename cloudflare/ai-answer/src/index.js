/**
 * 站点问答的生成端。
 *
 * 职责边界：本 Worker 只做生成，不做召回。召回由浏览器端的 Pagefind 完成——
 * 站点构建时已生成 Pagefind 索引，中文分词可用，且读取静态文件不消耗
 * Workers AI 额度。前端把问题与 top-K 片段一并提交，此处的任务是
 * 依据片段作答并标注来源。
 *
 * 这样分工的原因见 adr/2026-09-14-AI-Search-容量限流调优.md §6.3：
 * Cloudflare AI Search 的关键词索引对中文不分词（trigram 亦无效），
 * 纯中文查询召回恒为 0，而站点主体语言为中文。
 *
 * 接口：
 *   POST /          body { query: string, contexts: Array<{url, title, text}> }
 *   响应为 SSE：逐段输出 data: {"content": "..."}，以 data: [DONE] 结束。
 *
 * 防护：
 *   - 校验来源（ALLOWED_ORIGIN）、方法与内容类型；
 *   - 限制片段数量与单片段长度，控制单次请求的 prompt 规模；
 *   - 校验片段 URL 归属站点，避免被当作通用生成代理。
 */

/**
 * 本文件用 JSDoc 标注类型，由 `pnpm check:worker`（tsc --checkJs --strict）校验；
 * 绑定与变量的类型见同目录 env.d.ts；纯文本规则见 ../../shared/plain-text.js。
 *
 * @typedef {Record<string, string>} ResponseHeaders 响应头集合（不含 undefined 值）
 * @typedef {{ url?: unknown, title?: unknown, text?: unknown }} RawContext 请求体里未经校验的片段
 * @typedef {{ url: string, title: string, text: string }} Context 校验后的片段
 */

const MAX_CONTEXTS = 6;
const MAX_CONTEXT_CHARS = 1500;
const MAX_QUERY_CHARS = 200;
const MAX_BODY_BYTES = 64 * 1024;

const SYSTEM_PROMPT = [
  '你是 Doc Record 技术文档站点的问答助手。',
  '只依据提供的片段回答问题，不要引入片段之外的信息。',
  '回答使用简体中文，保持简洁，优先给出结论与关键命令或配置项。',
  '每个结论后在句末标注来源编号，编号取自片段开头的 [n] 标记，'
    + '写成方括号加数字的形式，例如 [1]；多个来源并列写作 [1][2]。',
  '若片段中没有能够支撑答案的内容，直接回答“未在文档中找到相关内容”，不要编造，'
    + '也不要标注来源编号。',
  // 用户经常只输入关键词（docker、Redis）：这类输入没有明确问题，若只按“回答片段中的问题”
  // 判断，模型会随机拒答 —— 实测同一句 Redis 在片段含 RedisInsight 命令时回了“未找到”。
  '若用户只给出关键词或短语（没有具体问题），就把片段中与该关键词相关的内容概括列出，'
    + '并标注来源；只有片段确实与该关键词无关时，才回答“未在文档中找到相关内容”。',
  '输出示例：Redis 支持 RDB 与 AOF 两种持久化方式 [1][2]。',
].join('');

// HTML → 纯文本与浏览器端共用同一份实现（代码审查发现项 M7）：此前两边各写一遍，
// 前端只剥标签、这里还会解码实体，同一段文本得到的 prompt 与展示不一致。
import { toPlainText } from '../../../shared/plain-text.js';

/**
 * 汇总 CORS 响应头，预检请求直接复用。
 *
 * @param {string} origin 请求来源；为空串表示非浏览器调用
 * @returns {ResponseHeaders}
 */
function corsHeaders(origin) {
  /** @type {ResponseHeaders} */
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  // 浏览器调用回显来源；无 Origin 的非浏览器调用不带该头（见 fetch 内的判定）
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

/**
 * @param {string} message
 * @param {number} status
 * @param {ResponseHeaders} headers
 * @returns {Response}
 */
function jsonError(message, status, headers) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/**
 * @param {string} origin
 * @returns {ResponseHeaders}
 */
function sseHeaders(origin) {
  return {
    ...corsHeaders(origin),
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Accel-Buffering': 'no',
  };
}

/**
 * @param {string} query
 * @param {Context[]} contexts
 * @returns {string}
 */
function buildPrompt(query, contexts) {
  const blocks = contexts
    .map((item, index) => {
      const title = toPlainText(item.title) || item.url;
      const body = toPlainText(item.text).slice(0, MAX_CONTEXT_CHARS);
      // 片段正文常自带序号，编号需与正文区分，否则模型会把两者混淆
      // （实测把正文的 4. 输出成 .，编号输出成空的 []）。
      return `片段 [${index + 1}]：${title}\n${body}`;
    })
    .join('\n\n');
  return `问题：${query}\n\n片段：\n${blocks}`;
}

/**
 * 取模型返回的文本。
 *
 * 审查项 U3：`stream: false` 下的实际返回结构在不同模型间存在差异，历史上同时兼容
 * 「字符串」「{ response }」「{ result: { response } }」三种形态。这里把不确定性收敛到
 * 一处并显式收窄，避免类型检查把它当成 any 放过去；无法识别时返回空串由调用方兜底。
 *
 * @param {unknown} result
 * @returns {string}
 */
function readModelText(result) {
  if (typeof result === 'string') return result;
  if (result && typeof result === 'object') {
    const direct = /** @type {{ response?: unknown }} */ (result).response;
    if (typeof direct === 'string') return direct;
    const nested = /** @type {{ result?: { response?: unknown } }} */ (result).result?.response;
    if (typeof nested === 'string') return nested;
  }
  return '';
}

/**
 * 把生成侧失败映射为可区分的响应。
 *
 * 审查项 M12：此前所有失败都返回 502，前端无法区分「可重试」与「需等到次日」。
 * 错误码取自 adr/2026-09-14-AI-Search-容量限流调优.md 的实测表：
 *   3036 Account limited —— 当日免费额度用尽，重试无效，次日 00:00 UTC 重置 → 429
 *   3040 Out of capacity —— 当时无可用 GPU 承接，瞬时态，重试通常成功 → 503 + Retry-After
 * 运行时错误对象的形态未在文档中固定，这里同时看 `code` 字段与消息文本；
 * 匹配不到时按 502 处理（保持原行为，前端仍提示可重试）。
 *
 * @param {unknown} error
 * @param {ResponseHeaders} headers
 * @returns {Response}
 */
function generationError(error, headers) {
  const code = /** @type {{ code?: unknown }} */ (error)?.code ?? '';
  const message = error instanceof Error ? error.message : String(error ?? '');
  const detail = `${String(code)} ${message}`;

  if (/\b3036\b|account limited/i.test(detail)) {
    return jsonError('generation quota exhausted', 429, headers);
  }
  if (/\b3040\b|out of capacity/i.test(detail)) {
    return jsonError('generation capacity unavailable', 503, { ...headers, 'Retry-After': '10' });
  }
  return jsonError('generation unavailable', 502, headers);
}

/** @type {ExportedHandler<Env>} */
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';
    const allowedOrigin = env.ALLOWED_ORIGIN || '*';

    // 未携带 Origin 的浏览器请求按同源处理，直接回显来源；
    // 配置了白名单时，只对该来源回显，其余来源拒绝。
    // 白名单按逗号分隔逐项做相等比较：前缀匹配会被
    // https://doc-record.iuin888vip.icu.evil.com 这类同前缀域名绕过。
    const allowed = allowedOrigin
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const originAllowed = !origin || allowed.includes('*') || allowed.includes(origin);
    if (!originAllowed) {
      return jsonError('Origin not allowed', 403, corsHeaders(''));
    }

    // 无 Origin 的调用（curl、服务端调用）不受同源策略约束，回显 `*` 只会
    // 掩盖「配置了 ALLOWED_ORIGIN 即受保护」的误判，故这类请求不返回 CORS 头。
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== 'POST') {
      return jsonError('Method not allowed', 405, headers);
    }
    if (!(request.headers.get('Content-Type') ?? '').includes('application/json')) {
      return jsonError('Expected application/json', 415, headers);
    }

    // Content-Length 由客户端声明，可省略（chunked）或伪造，只能作快速拒绝；
    // 真正的上限按读取后的实际字节数判定。
    const declaredLength = Number(request.headers.get('Content-Length') ?? '0');
    if (declaredLength > MAX_BODY_BYTES) {
      return jsonError('Payload too large', 413, headers);
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonError('Payload too large', 413, headers);
    }

    /** @type {{ query?: unknown, contexts?: unknown }} */
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return jsonError('Invalid JSON body', 400, headers);
    }

    const query = toPlainText(payload?.query).slice(0, MAX_QUERY_CHARS);
    const rawContexts = /** @type {RawContext[]} */ (
      Array.isArray(payload?.contexts) ? payload.contexts : []
    );
    // 站点来源按 origin 相等比较：startsWith 会被
    // https://doc-record.iuin888vip.icu.evil.com 这类同前缀域名绕过
    // （与上方 CORS 白名单同一原则）；解析失败的 URL 一律丢弃。
    const siteOrigin = new URL(env.SITE_URL || 'https://doc-record.iuin888vip.icu').origin;
    const contexts = rawContexts
      .filter((item) => {
        if (!item || typeof item.url !== 'string') return false;
        try {
          return new URL(item.url).origin === siteOrigin;
        } catch {
          return false;
        }
      })
      .slice(0, MAX_CONTEXTS)
      .map((item) => ({
        // 上面的 filter 已保证 url 是字符串且属于站点来源
        url: /** @type {string} */ (item.url),
        title: typeof item.title === 'string' ? item.title : '',
        text: typeof item.text === 'string' ? item.text : '',
      }))
      .filter((item) => item.text.length > 0);

    if (!query) {
      return jsonError('query is required', 400, headers);
    }
    if (contexts.length === 0) {
      return jsonError('contexts must contain at least one site document', 400, headers);
    }

    const model = env.GENERATION_MODEL || '@cf/qwen/qwen3-30b-a3b-fp8';
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildPrompt(query, contexts) },
    ];

    let result;
    try {
      result = await env.AI.run(model, {
        messages,
        // 该模型在流式输出下会吞掉数字：实测把「6379」输出为 []，
        // 正文序号「4.」输出为「.」，来源编号「[1]」同样变成 []。
        // 改为一次性返回，牺牲逐字输出换取内容正确。
        stream: false,
        max_tokens: 800,
      });
    } catch (error) {
      console.error('generation failed', error);
      return generationError(error, headers);
    }

    const text = readModelText(result).replace(/^\s+/, '');

    // 单事件 SSE：`stream: false` 是刻意的（见上方注释，该模型流式下会吞数字），
    // 因此不存在流式分支 —— 审查项 M5 删掉了此前永不执行的 toAnswerStream 与对应判断。
    const body = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });
    return new Response(body, { headers: sseHeaders(origin) });
  },
};
