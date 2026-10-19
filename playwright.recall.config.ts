import { defineConfig, devices } from '@playwright/test';

/**
 * 召回质量门禁：与 `playwright.config.ts` 分开，因为两者需要**不同的构建**——
 * 常规 e2e 不设 `PUBLIC_AI_ANSWER_URL`，跑的是 NLWeb 回退链路；这里必须设上，
 * 面板才会走「浏览器端召回 + 自建生成端」的真实路径。
 *
 * 生成端地址指向一个不可达域名：用例会拦截该请求、从中取回召回的上下文，
 * 因此不会真的调用线上 Worker。
 */
export default defineConfig({
  testDir: './tests/recall',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4332',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command:
      'PUBLIC_AI_ANSWER_URL=https://recall-eval.test/ask pnpm run build && pnpm exec astro preview --port 4332',
    url: 'http://localhost:4332',
    reuseExistingServer: !process.env.CI,
    timeout: 5 * 60 * 1000,
  },
});
