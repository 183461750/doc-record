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

/** 桩化 AI 绑定：`run` 固定返回给定结果，不触网、不消耗额度。 */
function makeEnv(modelResult, overrides = {}) {
  return {
    AI: { run: async () => modelResult },
    ALLOWED_ORIGIN: SITE,
    GENERATION_MODEL: 'test-model',
    SITE_URL: SITE,
    ...overrides,
  };
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

console.log(`worker 最小用例：${passed} 项全部通过`);
