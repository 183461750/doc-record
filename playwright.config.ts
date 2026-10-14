import { defineConfig, devices } from '@playwright/test';

/**
 * e2e 测试配置。
 *
 * 测试针对构建产物运行（astro preview）：静态站点的 e2e 关注的是
 * 「构建产物里的最终行为」，dev server 的 HMR 与按需编译会掩盖部分问题。
 * 本地复用已在运行的 preview 服务，CI 中由 webServer 自行启动。
 */
export default defineConfig({
  testDir: './tests/e2e',
  // 站点含 368 个内容页，全量构建后冒烟用例只需覆盖代表性页面，
  // 全站巡检交给构建期检查与内容门禁。
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    // 4321 常被本机其他服务占用，e2e 固定使用独立端口
    baseURL: 'http://localhost:4331',
    trace: 'on-first-retry',
    locale: 'zh-CN',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // CI 与本机统一用 pnpm 执行：bun 仅在本机存在，CI 环境无此二进制。
    // 例外：CLAUDE.md 记录了本机 pnpm install 被安全策略拦截时改用 bun 安装依赖的绕法，
    // 那种环境下本机跑 e2e 需自行 `bun run build && bunx astro preview --port 4331`，
    // 或先手动起 preview（reuseExistingServer 为真时会直接复用）。
    command: 'pnpm run build && pnpm exec astro preview --port 4331',
    url: 'http://localhost:4331',
    reuseExistingServer: !process.env.CI,
    timeout: 5 * 60 * 1000,
  },
});
