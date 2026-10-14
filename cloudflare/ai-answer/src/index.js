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
  '若片段中没有能够支撑答案的内容，直接回答“未在文档中找到相关内容”，不要编造。',
  '输出示例：Redis 支持 RDB 与 AOF 两种持久化方式 [1][2]。',
].join('');

/** 汇总 CORS 响应头，预检请求直接复用。 */
function corsHeaders(origin) {
  return {
    // 浏览器调用回显来源；无 Origin 的非浏览器调用不带该头（见 fetch 内的判定）
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function jsonError(message, status, headers) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function sseHeaders(origin) {
  return {
    ...corsHeaders(origin),
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Accel-Buffering': 'no',
  };
}

/** 去掉 HTML 标签并压缩空白，片段取自 Pagefind 的正文，含少量标记。 */
function normalize(text) {
  return String(text ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildPrompt(query, contexts) {
  const blocks = contexts
    .map((item, index) => {
      const title = normalize(item.title) || item.url;
      const body = normalize(item.text).slice(0, MAX_CONTEXT_CHARS);
      // 片段正文常自带序号，编号需与正文区分，否则模型会把两者混淆
      // （实测把正文的 4. 输出成 .，编号输出成空的 []）。
      return `片段 [${index + 1}]：${title}\n${body}`;
    })
    .join('\n\n');
  return `问题：${query}\n\n片段：\n${blocks}`;
}

/**
 * 把 Workers AI 的流式输出转换为本站的 SSE 格式。
 * 上游事件形如 data: {"response":"..."}，结束为 data: [DONE]。
 */
function toAnswerStream(upstream) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';
  // 上游首个分片常带换行等前导空白，直接透传会让答案开头出现空行。
  let started = false;

  return upstream.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        // 末段可能是不完整的一行，留到下一个分片再处理。
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          let text;
          try {
            const parsed = JSON.parse(payload);
            text = parsed.response ?? parsed.content ?? parsed.text;
          } catch {
            continue;
          }
          if (typeof text === 'string' && text) {
            const outgoing = started ? text : text.replace(/^\s+/, '');
            if (!outgoing) continue;
            started = true;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: outgoing })}\n\n`));
          }
        }
      },
      flush(controller) {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      },
    })
  );
}

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

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return jsonError('Invalid JSON body', 400, headers);
    }

    const query = normalize(payload?.query).slice(0, MAX_QUERY_CHARS);
    const rawContexts = Array.isArray(payload?.contexts) ? payload.contexts : [];
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
        url: item.url,
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
      // 生成侧失败多由容量限制引起，属瞬时态，交由前端提示重试。
      console.error('generation failed', error);
      return jsonError('generation unavailable', 502, headers);
    }

    const raw =
      (typeof result === 'string' && result) ||
      result?.response ||
      result?.result?.response ||
      '';
    const text = String(raw).replace(/^\s+/, '');

    // 上游返回完整文本时包装成单个事件，保持前端的解析方式不变。
    if (!(result instanceof ReadableStream)) {
      const body = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });
      return new Response(body, { headers: sseHeaders(origin) });
    }

    return new Response(toAnswerStream(result), { headers: sseHeaders(origin) });
  },
};
