import { expect, test } from '@playwright/test';

/**
 * 召回质量基线（金标准）。
 *
 * 为什么需要它：`shared/recall.js` 的窗口选择、分词与名次融合都是启发式的，
 * 此前只有「面板能出答案」这类端到端冒烟，没有任何“召回有没有命中正确页面”的度量。
 * 这组用例直接驱动真实面板（不 mock 召回本身），从发给生成端的请求体里取回
 * `contexts`，断言**期望页面在召回结果的前 3 条里**。
 *
 * 维护约定：
 *   - 问题取自各分类的真实文档主题，期望页面必须是该问题的主要出处；
 *   - 内容改版导致某条期望不再成立时，改**期望**而不是放宽阈值 —— 除非该问题本身已失去意义；
 *   - 阈值取 90%：允许个别问题因文档措辞变化掉队，但整体质量不能无声下滑。
 */

/**
 * 问题 + 可接受的页面（路径用解码后的形式书写，比较时统一解码）。
 *
 * `accept` 是**多个等价正确答案**，不是放宽标准：同一个问题常有多篇同样正确的文档
 * （例如 nacos 既有 docker 部署文档也有 k8s 部署文档）。若所有候选都没进前 K 条，
 * 仍计为未命中。
 */
const GOLDEN: { question: string; accept: string[] }[] = [
  { question: 'kubeasz 怎么部署高可用 k8s 集群', accept: ['/zh-cn/kubernetes/installs/kubeasz/doc/'] },
  { question: 'cert-manager 怎么卸载', accept: ['/zh-cn/kubernetes/docs/cert-manager/cert-manager/'] },
  { question: 'devcontainer 怎么共享 ssh 密钥', accept: ['/zh-cn/docker/dev_utls/dev-container/example/devcontainer-记录/'] },
  { question: '本地 https 证书怎么生成', accept: ['/zh-cn/network/mkcert_freemyip_nginx/doc/'] },
  { question: 'nvmrc 怎么用', accept: ['/zh-cn/docker/doc/material/env/nvmrc如何使用/'] },
  { question: 'arthas 怎么查看 sql 参数', accept: ['/zh-cn/materiel/draft/arthas查看sql_redis_es/'] },
  // 已知未命中（基线 2026-10-19）：top-1 被 hub 页 /zh-cn/kubernetes/kubernetes/ 占据，本页未进前 3
  { question: '怎么安装 k8s', accept: ['/zh-cn/kubernetes/installs/install_k8s/doc/'] },
  {
    question: 'docker compose 怎么让服务按顺序启动',
    accept: ['/zh-cn/blog/docker/doc/article/docker-compose服务间依赖通过自定义健康检查实现顺序启动/'],
  },
  { question: 'nacos 怎么部署', accept: ['/zh-cn/kubernetes/app/nacos/nacos/', '/zh-cn/docker/mid/nacos/doc/'] },
  { question: 'mihomo docker 版怎么配置', accept: ['/zh-cn/materiel/ai/mihomo/docker版mihomo的sop/', '/zh-cn/materiel/ai/mihomo/docker/doc/'] },
  { question: 'vscode remote ssh 连不上怎么办', accept: ['/zh-cn/os/linux/problems/vscode-remote-ssh/doc/'] },
  { question: 'maven 怎么生成 querydsl 实体类', accept: ['/zh-cn/materiel/ai/maven如何生成querydsl的q版实体类/'] },
  {
    question: 'spring-data-redis 的 jedis optional 依赖问题',
    accept: ['/zh-cn/materiel/ai/spring-data-redis中的依赖的jedis添加了optionaltrue需要开发者主动显式依赖的问题/'],
  },
  {
    question: 'frp 怎么用 ssh 打通内网',
    accept: [
      '/zh-cn/blog/docker/dev_utls/dev-container/remote-ssh/frp/article/frp_ssh组合镜像以及clash打通网络/',
      '/zh-cn/blog/docker/dev_utls/dev-container/remote-ssh/frp/article/frp_ssh组合镜像以及sshuttle打通网络/',
    ],
  },
  { question: 'nocobase start 脚本怎么用', accept: ['/zh-cn/docker/dev_utls/serverless/nocobase/publish/help/'] },
];

/** 期望页面须落在前 3 条召回上下文里。 */
const TOP_K = 3;

/** 整体命中率下限。 */
const MIN_HIT_RATE = 0.9;

/** 把绝对地址或相对路径统一成解码后的 pathname，便于比较。 */
function pathnameOf(url: string): string {
  return decodeURIComponent(new URL(url, 'http://localhost').pathname);
}

test('召回命中率不低于基线（期望页面落在前 3 条）', async ({ page }) => {
  await page.goto('/zh-cn/');
  await page.locator('.ai-ask-open').click();

  // 拦截“生成端”请求：只取召回结果，不真的调用线上 Worker。
  // 用数组按到达顺序记录：本轮请求数增加即代表这一题的召回已完成。
  const bodies: { contexts?: { url: string }[] }[] = [];
  await page.route('https://recall-eval.test/ask', async (route) => {
    bodies.push(route.request().postDataJSON() as { contexts?: { url: string }[] });
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream; charset=utf-8' },
      body: 'data: {"content":"ok"}\n\ndata: [DONE]\n\n',
    });
  });

  const input = page.locator('.ai-ask-input');
  const submit = page.locator('.ai-ask-submit');
  const result = page.locator('.ai-ask-result');
  // 召回为空时面板显示这句、且不会发请求（见 AiAsk.astro 的 data-empty）
  const emptyText = (await page.locator('.ai-ask-panel').getAttribute('data-empty')) ?? '';

  /**
   * 等这一题出结果：请求到达（正常）或面板显示“未检索到”（空召回）。
   * 返回 'sent' | 'empty' | 'timeout' —— 后两者计为未命中。
   */
  async function waitForOutcome(before: number): Promise<'sent' | 'empty' | 'timeout'> {
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      if (bodies.length > before) return 'sent';
      if (emptyText && (await result.innerText()).includes(emptyText)) return 'empty';
      await page.waitForTimeout(100);
    }
    return 'timeout';
  }

  const misses: string[] = [];
  for (const { question, accept } of GOLDEN) {
    const before = bodies.length;
    await input.fill(question);
    await submit.click();
    const outcome = await waitForOutcome(before);

    const contexts = outcome === 'sent' ? (bodies.at(-1)?.contexts ?? []) : [];
    const top = contexts.slice(0, TOP_K).map((item) => pathnameOf(item.url));
    const wanted = accept.map((item) => decodeURIComponent(item));
    const hit = top.some((item) => wanted.includes(item));
    if (!hit) {
      const shown = outcome === 'sent' ? top.join(' , ') || '（无召回）' : `（${outcome}）`;
      misses.push(`「${question}」期望其一 ${accept.join(' | ')}\n    实际前 ${TOP_K}：${shown}`);
    }
  }

  const hitRate = (GOLDEN.length - misses.length) / GOLDEN.length;
  console.log(`  召回命中率：${(hitRate * 100).toFixed(1)}%（${GOLDEN.length - misses.length}/${GOLDEN.length}）`);
  if (misses.length > 0) console.log(`  未命中：\n    ${misses.join('\n    ')}`);

  expect(hitRate).toBeGreaterThanOrEqual(MIN_HIT_RATE);
});
