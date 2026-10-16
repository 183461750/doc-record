/**
 * Worker 绑定与变量的类型声明。
 *
 * 与同目录上级的 `wrangler.toml` 一一对应：`[ai] binding = "AI"` 与 `[vars]` 下的三项。
 * 这里手写而不使用 `wrangler types`：本仓库未把 worker 纳入 pnpm workspace，生成命令需要
 * 额外安装 wrangler，而绑定规模很小，人工同步的成本低于引入那套机制。
 * **修改 wrangler.toml 的绑定或变量时必须同步本文件**（否则 tsc 会在这里报错，属预期保护）。
 */

interface Env {
  /** Workers AI 绑定，见 wrangler.toml 的 `[ai]`。 */
  AI: Ai;
  /** 允许调用该端点的来源，逗号分隔；由 wrangler.toml 提供。 */
  ALLOWED_ORIGIN?: string;
  /** 生成使用的模型标识，由 wrangler.toml 提供。 */
  GENERATION_MODEL?: string;
  /** 站点来源，用于校验片段归属，由 wrangler.toml 提供。 */
  SITE_URL?: string;
}
