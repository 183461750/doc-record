import { expect, test } from '@playwright/test';

/**
 * 全站问答悬浮入口：面板开关与基本交互。
 *
 * 问答的召回与生成依赖 Pagefind 索引与外部生成端，这里只验证
 * 纯前端的交互行为；端到端问答质量由部署后的生产环境验证。
 */

test('悬浮入口渲染在页面上', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.ai-ask-launcher')).toBeVisible();
});

test('点击入口展开面板，Esc 关闭', async ({ page }) => {
  await page.goto('/');
  const panel = page.locator('.ai-ask-panel');
  await expect(panel).toBeHidden();

  await page.locator('.ai-ask-open').click();
  await expect(panel).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
});

/**
 * 生成端区分「可重试」与「当日额度耗尽」后，前端的提示也应区分：
 * 429 给出次日再试的文案，其余失败仍是通用的暂不可用。
 */
test('额度耗尽（429）时提示次日再试', async ({ page }) => {
  await page.route('**/ask', (route) =>
    route.fulfill({
      status: 429,
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
      body: '{"error":"generation quota exhausted"}',
    }),
  );

  await page.goto('/zh-cn/docker/app/firefox/firefox/');
  await page.locator('.ai-ask-open').click();
  await page.locator('.ai-ask-input').fill('Redis 持久化');
  await page.locator('.ai-ask-submit').click();

  await expect(page.locator('.ai-ask-result')).toHaveText(/额度已用完/);
});

test('其他失败仍提示暂不可用', async ({ page }) => {
  await page.route('**/ask', (route) =>
    route.fulfill({
      status: 502,
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
      body: '{"error":"generation unavailable"}',
    }),
  );

  await page.goto('/zh-cn/docker/app/firefox/firefox/');
  await page.locator('.ai-ask-open').click();
  await page.locator('.ai-ask-input').fill('Redis 持久化');
  await page.locator('.ai-ask-submit').click();

  const result = page.locator('.ai-ask-result');
  await expect(result).not.toHaveText(/额度已用完/);
  await expect(result).toHaveText(/暂时/);
});

/**
 * 并发提交的边界：双击不应重复请求，换问题重问不应让旧响应污染新输出。
 *
 * 背景（代码审查发现项 H2）：提交原先既不取消上一次请求也不去重，双击会白跑一次生成，
 * 且两次响应争抢同一输出区，出现「答案与来源错配」。这里用慢响应把窗口撑开，
 * 断言请求次数与输出归属。
 */
test('同一问题重复提交只请求一次，换问题重问以新响应为准', async ({ page }) => {
  let requests = 0;
  await page.route('**/ask', async (route) => {
    requests += 1;
    const index = requests;
    // 让请求停留在途中，才有机会触发第二次提交
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/event-stream; charset=utf-8' },
        body: `data: {"answer":"答案 ${index}"}\n\ndata: [DONE]\n\n`,
      });
    } catch {
      // 请求已被后一次提交取消（这正是被测行为之一）
    }
  });

  await page.goto('/zh-cn/docker/app/firefox/firefox/');
  await page.locator('.ai-ask-open').click();
  const result = page.locator('.ai-ask-result');
  const input = page.locator('.ai-ask-input');

  // 第一次提交：进入「检索中」
  await input.fill('Redis 有哪两种持久化方式');
  await page.locator('.ai-ask-submit').click();
  await expect(result).toHaveText(/检索中/);

  // 同一问题再次提交：应被忽略，请求数不变
  await page.locator('.ai-ask-submit').click();
  await expect(result).toContainText('答案 1');
  expect(requests, '同一问题重复提交不应重复请求').toBe(1);

  // 上一个请求进行中换问题提交：发出新请求，且输出只属于新请求
  await input.fill('另一个问题');
  await page.locator('.ai-ask-submit').click();
  await expect(result).toContainText('答案 2');
  expect(requests, '换问题应发出新请求').toBe(2);
  await expect(result, '旧响应不应污染新输出').not.toContainText('答案 1');
});

/**
 * 交互补强：清空、失败重试、复制答案、窄屏适配。
 * 这些都依赖真实面板行为，故拦截生成端后驱动 UI 验证。
 */
test('有人问答后出现清空按钮，点击后重置面板', async ({ page }) => {
  await page.route('**/ask', (route) =>
    route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream; charset=utf-8' },
      body: 'data: {"content":"答案内容"}\n\ndata: [DONE]\n\n',
    }),
  );
  await page.goto('/zh-cn/docker/app/firefox/firefox/');
  await page.locator('.ai-ask-open').click();

  const clear = page.locator('.ai-ask-clear');
  await expect(clear).toBeHidden();

  await page.locator('.ai-ask-input').fill('Redis 持久化');
  await page.locator('.ai-ask-submit').click();
  await expect(page.locator('.ai-ask-result')).toContainText('答案内容');
  await expect(clear).toBeVisible();

  await clear.click();
  await expect(page.locator('.ai-ask-result')).toHaveText('');
  await expect(page.locator('.ai-ask-input')).toHaveValue('');
  await expect(clear).toBeHidden();
});

test('失败后给出重试入口，重试会重新请求', async ({ page }) => {
  let calls = 0;
  await page.route('**/ask', (route) => {
    calls += 1;
    if (calls === 1) {
      return route.fulfill({ status: 502, headers: { 'content-type': 'application/json' }, body: '{}' });
    }
    return route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream; charset=utf-8' },
      body: 'data: {"content":"重试成功"}\n\ndata: [DONE]\n\n',
    });
  });

  await page.goto('/zh-cn/docker/app/firefox/firefox/');
  await page.locator('.ai-ask-open').click();
  await page.locator('.ai-ask-input').fill('Redis 持久化');
  await page.locator('.ai-ask-submit').click();

  const retry = page.locator('.ai-ask-action', { hasText: '重试' });
  await expect(retry).toBeVisible();
  await retry.click();

  await expect(page.locator('.ai-ask-result')).toContainText('重试成功');
  expect(calls).toBe(2);
});

test('复制答案写入剪贴板并给出反馈', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.route('**/ask', (route) =>
    route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream; charset=utf-8' },
      body: 'data: {"content":"先看 `iptables -t nat -L` 规则。"}\n\ndata: [DONE]\n\n',
    }),
  );

  await page.goto('/zh-cn/docker/app/firefox/firefox/');
  await page.locator('.ai-ask-open').click();
  await page.locator('.ai-ask-input').fill('网络不通怎么排查');
  await page.locator('.ai-ask-submit').click();

  // 行内代码渲染成 <code>，不是字面反引号
  await expect(page.locator('.ai-ask-answer-text code')).toHaveText('iptables -t nat -L');

  const copy = page.locator('.ai-ask-copy');
  await copy.click();
  await expect(copy).toHaveText('已复制');
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain('iptables -t nat -L');
});

test('窄屏下面板不超出视口', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 720 });
  await page.goto('/zh-cn/docker/app/firefox/firefox/');
  await page.locator('.ai-ask-open').click();

  const fits = await page.evaluate(() => {
    const rect = document.querySelector('.ai-ask-panel')?.getBoundingClientRect();
    return rect ? rect.left >= 0 && rect.right <= window.innerWidth : false;
  });
  expect(fits).toBe(true);
});

/**
 * 动态内容的样式回归。
 *
 * 面板内的答案、spinner、复制/重试按钮都是脚本创建的 —— Astro scoped CSS 只作用于
 * 模板元素，漏写 :global() 时样式会静默失效（曾有：spinner 尺寸为 0、围栏代码块没有
 * 底色）。只看文本的用例发现不了，所以这里断言计算样式。
 */
test('围栏代码块渲染为代码块，动态内容样式生效', async ({ page }) => {
  await page.route('**/ask', (route) =>
    route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream; charset=utf-8' },
      body:
        `data: ${JSON.stringify({ content: '步骤：\n\n```bash\nhelm delete cert-manager\n```\n\n再用 `kubectl get ns` 确认。' })}\n\n` +
        'data: [DONE]\n\n',
    }),
  );
  await page.goto('/zh-cn/docker/app/firefox/firefox/');
  await page.locator('.ai-ask-open').click();
  await page.locator('.ai-ask-input').fill('cert-manager 怎么卸载');
  await page.locator('.ai-ask-submit').click();

  const answer = page.locator('.ai-ask-answer-text');
  await expect(answer.locator('pre code')).toHaveText('helm delete cert-manager');
  await expect(answer).not.toContainText('```');
  await expect(answer.locator('code').filter({ hasText: 'kubectl get ns' })).toHaveCount(1);

  const styles = await page.evaluate(() => {
    const pre = document.querySelector('.ai-ask-answer-text pre');
    const inline = [...document.querySelectorAll('.ai-ask-answer-text code')].find((el) => !el.closest('pre'));
    const copy = document.querySelector('.ai-ask-copy');
    return {
      preBg: pre ? getComputedStyle(pre).backgroundColor : null,
      prePadding: pre ? getComputedStyle(pre).padding : null,
      inlineBg: inline ? getComputedStyle(inline).backgroundColor : null,
      copyBorder: copy ? getComputedStyle(copy).borderTopWidth : null,
      copyPadding: copy ? getComputedStyle(copy).padding : null,
    };
  });
  expect(styles.preBg).not.toBe('rgba(0, 0, 0, 0)');
  expect(styles.prePadding).not.toBe('0px');
  expect(styles.inlineBg).not.toBe('rgba(0, 0, 0, 0)');
  expect(styles.copyBorder).not.toBe('0px');
  expect(styles.copyPadding).not.toBe('0px');
});

test('加载态显示有尺寸的 spinner', async ({ page }) => {
  await page.route('**/ask', () => {});
  await page.goto('/zh-cn/docker/app/firefox/firefox/');
  await page.locator('.ai-ask-open').click();
  await page.locator('.ai-ask-input').fill('网络不通怎么排查');
  await page.locator('.ai-ask-submit').click();

  const spinner = page.locator('.ai-ask-spinner');
  await expect(spinner).toBeVisible();
  const box = await spinner.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(8);
  expect(box?.height ?? 0).toBeGreaterThan(8);
});

test('来源列表渲染为可点击链接', async ({ page }) => {
  await page.route('**/ask', (route) =>
    route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream; charset=utf-8' },
      body:
        `data: ${JSON.stringify({
          results: [
            { url: 'https://example.com/a', name: '参考文档 A', description: '说明 A' },
            { url: 'https://example.com/b', name: '参考文档 B' },
          ],
        })}\n\n` +
        `data: ${JSON.stringify({ content: '答案正文' })}\n\ndata: [DONE]\n\n`,
    }),
  );
  await page.goto('/zh-cn/docker/app/firefox/firefox/');
  await page.locator('.ai-ask-open').click();
  await page.locator('.ai-ask-input').fill('测试来源');
  await page.locator('.ai-ask-submit').click();

  const links = page.locator('.ai-ask-result ol li a');
  await expect(links).toHaveCount(2);
  await expect(links.first()).toHaveAttribute('href', 'https://example.com/a');
  await expect(links.first()).toHaveAttribute('rel', 'noopener noreferrer');
});

test('长答案出现后结果区停在答案开头', async ({ page }) => {
  const longAnswer = `第一段开始。\n\n${'这是一段用于撑高结果区的中文内容。'.repeat(30)}\n\n结尾段落。`;
  await page.route('**/ask', (route) =>
    route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream; charset=utf-8' },
      body:
        `data: ${JSON.stringify({
          results: Array.from({ length: 6 }, (_, i) => ({
            url: `https://example.com/${i}`,
            name: `参考 ${i}`,
            description: '说明',
          })),
        })}\n\n` +
        `data: ${JSON.stringify({ content: longAnswer })}\n\ndata: [DONE]\n\n`,
    }),
  );
  await page.goto('/zh-cn/docker/app/firefox/firefox/');
  await page.locator('.ai-ask-open').click();
  await page.locator('.ai-ask-input').fill('长答案测试');
  await page.locator('.ai-ask-submit').click();
  await expect(page.locator('.ai-ask-answer-text')).toContainText('第一段开始');

  const scrollTop = await page.evaluate(() => document.querySelector('.ai-ask-result')?.scrollTop ?? -1);
  expect(scrollTop).toBe(0);
});
