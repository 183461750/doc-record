/**
 * Worker 最小用例：不起网络，用 Node 内建的 Request/Response 与桩化的 AI 绑定直接调用
 * 默认导出的 `fetch`。覆盖四类行为：
 *
 * 1. 来源白名单（含白名单外 403、无 Origin 的调用不返回 CORS 头 —— 审查项 M4）；
 * 2. 片段归属校验（同前缀域名伪造必须被拒 —— 审查项 M2）；
 * 3. 请求体上限（超过 64 KB 返回 413 —— 审查项 M3）；
 * 4. 模型返回结构的三种形态（字符串 / `{response}` / `{result:{response}}` —— 审查项 U3）。
 *
 * 运行：`pnpm test:worker`（CI 见 .github/workflows/typecheck.yml）。
 */
import assert from 'node:assert/strict';

import worker from './src/index.js';

const SITE = 'https://doc-record.iuin888vip.icu';

/**
 * 桩化 AI 绑定：不触网、不消耗额度。参数为 `Error` 时抛出（用于失败路径），
 * 其余情况返回该值；每次调用的入参记录在 `calls` 里，便于断言真正送进模型的消息。
 */
function makeEnv(modelResult, overrides = {}) {
  const calls = [];
  return {
    AI: {
      run: async (model, inputs) => {
        calls.push({ model, inputs });
        if (modelResult instanceof Error) throw modelResult;
        return modelResult;
      },
    },
    ALLOWED_ORIGIN: SITE,
    GENERATION_MODEL: 'test-model',
    SITE_URL: SITE,
    calls,
    ...overrides,
  };
}

/** 取最后一次送进模型的消息文本。 */
function promptOf(env) {
  const messages = env.calls.at(-1)?.inputs?.messages ?? [];
  return messages.map((message) => message.content).join('\n');
}

const VALID_BODY = {
  query: 'Redis 有哪两种持久化方式',
  contexts: [{ url: `${SITE}/zh-cn/middleware/data/redis/redis/`, title: 'Redis', text: 'RDB 与 AOF。' }],
};

function post(body, headers = {}) {
  return new Request('https://doc-record-ai-answer.example/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

let passed = 0;
async function check(name, fn) {
  await fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

await check('U3：三种模型返回形态都产出同一段 SSE 文本', async () => {
  for (const shape of ['A', { response: 'A' }, { result: { response: 'A' } }]) {
    const res = await worker.fetch(post(VALID_BODY, { Origin: SITE }), makeEnv(shape));
    assert.equal(res.status, 200, `形态 ${JSON.stringify(shape)} 状态码应为 200`);
    const text = await res.text();
    assert.match(text, /data: \{"content":"A"\}/, `形态 ${JSON.stringify(shape)} 未正确取值`);
    assert.match(text, /data: \[DONE\]/);
  }
});

await check('U3：无法识别的返回结构降级为空内容而不是抛错', async () => {
  const res = await worker.fetch(post(VALID_BODY, { Origin: SITE }), makeEnv({ unexpected: true }));
  assert.equal(res.status, 200);
  assert.match(await res.text(), /data: \{"content":""\}/);
});

await check('M2：同前缀域名伪造的片段被拒', async () => {
  const body = { ...VALID_BODY, contexts: [{ url: `${SITE}.evil.com/x`, text: '任意内容' }] };
  const res = await worker.fetch(post(body, { Origin: SITE }), makeEnv('A'));
  assert.equal(res.status, 400);
  assert.match(await res.text(), /contexts must contain at least one site document/);
});

await check('M2：片段 URL 非站点来源时同样被拒', async () => {
  const body = { ...VALID_BODY, contexts: [{ url: 'https://example.com/x', text: '任意内容' }] };
  const res = await worker.fetch(post(body, { Origin: SITE }), makeEnv('A'));
  assert.equal(res.status, 400);
});

await check('M3：超过 64 KB 的请求体返回 413', async () => {
  const big = JSON.stringify({ query: 'x'.repeat(70 * 1024), contexts: [] });
  const res = await worker.fetch(post(big, { Origin: SITE }), makeEnv('A'));
  assert.equal(res.status, 413);
  assert.match(await res.text(), /Payload too large/);
});

await check('M4：白名单内来源回显该来源', async () => {
  const res = await worker.fetch(post(VALID_BODY, { Origin: SITE }), makeEnv('A'));
  assert.equal(res.headers.get('access-control-allow-origin'), SITE);
});

await check('M4：无 Origin 的调用不返回 CORS 头', async () => {
  const res = await worker.fetch(post(VALID_BODY), makeEnv('A'));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), null);
});

await check('M4：白名单外来源返回 403', async () => {
  const res = await worker.fetch(post(VALID_BODY, { Origin: 'https://evil.example' }), makeEnv('A'));
  assert.equal(res.status, 403);
});

await check('预检请求返回 204 且带方法声明', async () => {
  const res = await worker.fetch(
    new Request('https://doc-record-ai-answer.example/', { method: 'OPTIONS', headers: { Origin: SITE } }),
    makeEnv('A'),
  );
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('access-control-allow-methods'), 'POST, OPTIONS');
});

await check('缺 query 与非 JSON 内容类型分别返回 400 / 415', async () => {
  const missing = await worker.fetch(
    post({ contexts: VALID_BODY.contexts }, { Origin: SITE }),
    makeEnv('A'),
  );
  assert.equal(missing.status, 400);

  const wrongType = await worker.fetch(
    new Request('https://doc-record-ai-answer.example/', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', Origin: SITE },
      body: 'hello',
    }),
    makeEnv('A'),
  );
  assert.equal(wrongType.status, 415);
});

await check('M5：响应是单事件 SSE —— 流式死代码已删除，不存在第二条路径', async () => {
  const res = await worker.fetch(post(VALID_BODY, { Origin: SITE }), makeEnv('A'));
  const text = await res.text();
  assert.equal((text.match(/data: \{"content"/g) ?? []).length, 1);
  assert.equal((text.match(/data: \[DONE\]/g) ?? []).length, 1);
});

await check('M10：实体被解码，被编码的标记不会留在 prompt 里', async () => {
  const env = makeEnv('A');
  const body = {
    query: 'q',
    contexts: [
      {
        url: `${SITE}/zh-cn/middleware/x/`,
        title: 'R&amp;D',
        text: 'a &lt;script&gt;alert(1)&lt;/script&gt; b&nbsp;c &#39;d&#39; &#x4e2d;',
      },
    ],
  };
  await worker.fetch(post(body, { Origin: SITE }), env);
  const prompt = promptOf(env);

  assert.match(prompt, /R&D/, '命名实体应被解码');
  assert.ok(!prompt.includes('&amp;'), '残留未解码的 &amp;');
  assert.ok(!prompt.includes('&lt;'), '残留未解码的 &lt;');
  assert.ok(!prompt.includes('<script>') && !prompt.includes('<SCRIPT>'), '解码出来的标记没有被二次剥离（含大写）');
  assert.match(prompt, /'d'/, '数字实体应被解码');
  assert.match(prompt, /中/, '十六进制实体应被解码');
});

await check('M12：额度耗尽→429；容量不足→503+Retry-After；其余→502', async () => {
  const quotaError = Object.assign(new Error('3036: Account limited'), { code: 3036 });
  const quota = await worker.fetch(post(VALID_BODY, { Origin: SITE }), makeEnv(quotaError));
  assert.equal(quota.status, 429);
  assert.match(await quota.text(), /generation quota exhausted/);

  const capacityError = Object.assign(new Error('3040: Out of capacity'), { code: 3040 });
  const capacity = await worker.fetch(post(VALID_BODY, { Origin: SITE }), makeEnv(capacityError));
  assert.equal(capacity.status, 503);
  assert.equal(capacity.headers.get('retry-after'), '10');

  const other = await worker.fetch(post(VALID_BODY, { Origin: SITE }), makeEnv(new Error('boom')));
  assert.equal(other.status, 502);
});

await check('M12：仅消息里出现错误码也能识别（不依赖 code 字段）', async () => {
  const res = await worker.fetch(
    post(VALID_BODY, { Origin: SITE }),
    makeEnv(new Error('AiError: 3036 Account limited')),
  );
  assert.equal(res.status, 429);
});

await check('M10/CodeQL：`<<<<…` 这类输入不会触发多项式回溯', async () => {
  // 60000 个 `<`：贴近 64 KB 的体积上限（上限本身由 M3 的用例覆盖），
  // 正则版在这种输入下是多项式回溯，线性扫描则一遍过
  const hostile = '<'.repeat(60_000);
  const env = makeEnv('A');
  const started = Date.now();
  const res = await worker.fetch(
    post({ query: 'q', contexts: [{ url: `${SITE}/zh-cn/middleware/x/`, text: hostile }] }),
    env,
  );
  const elapsed = Date.now() - started;

  assert.equal(res.status, 200);
  // 线性扫描：64 KB 极限输入应在毫秒级完成（原先的正则在此输入下是多项式复杂度）
  assert.ok(elapsed < 1000, `处理 60 KB 恶意输入耗时 ${elapsed}ms，超出预期`);
});

await check('M10：大写标签同样被剥离（剥离逻辑与大小写无关）', async () => {
  const env = makeEnv('A');
  const body = {
    query: 'q',
    contexts: [{ url: `${SITE}/zh-cn/middleware/x/`, text: '前 &lt;SCRIPT&gt;alert(1)&lt;/SCRIPT&gt; 后' }],
  };
  await worker.fetch(post(body, { Origin: SITE }), env);
  const prompt = promptOf(env);

  assert.ok(!prompt.includes('<SCRIPT>') && !prompt.includes('</SCRIPT>'), '大写标签未被剥离');
  assert.ok(prompt.includes('前') && prompt.includes('后'), '标签之间的正文应保留');
});

await check('M10：未闭合的 `<` 之后按普通文本保留', async () => {
  const env = makeEnv('A');
  const body = {
    query: 'q',
    contexts: [{ url: `${SITE}/zh-cn/middleware/x/`, text: 'a<b>c<d e' }],
  };
  await worker.fetch(post(body, { Origin: SITE }), env);
  const prompt = promptOf(env);

  assert.ok(!prompt.includes('<b>') && !prompt.includes('<B>'), '闭合标签应被剥离（含大写）');
  assert.ok(prompt.includes('c<d e'), '未闭合标签后的内容应保留为文本');
});

await check('P1：系统提示覆盖“只输入关键词”的情形（docker / Redis 这类裸词）', async () => {
  const env = makeEnv('A');
  await worker.fetch(post({ query: 'Redis', contexts: VALID_BODY.contexts }, { Origin: SITE }), env);
  const prompt = promptOf(env);

  // 线上实测：片段里明明有 RedisInsight 部署命令，模型仍回了“未在文档中找到相关内容”，
  // 因为输入只是关键词、没有明确问题。规则必须显式覆盖这种输入。
  assert.match(prompt, /只给出关键词或短语/);
  assert.match(prompt, /概括列出/);
  // 拒答规则保留，且明确不标来源
  assert.match(prompt, /未在文档中找到相关内容/);
  assert.match(prompt, /不要标注来源编号/);
  // 用户问题本身仍要进 prompt
  assert.match(prompt, /Redis/);
});

console.log(`worker 最小用例：${passed} 项全部通过`);
