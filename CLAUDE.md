# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 Astro 与 Starlight 的技术文档站点，记录 Docker、Kubernetes 及其他工具的使用文档，
部署至 GitHub Pages，自定义域名 `https://doc-record.iuin888vip.icu`。

技术栈：

| 组件 | 版本 | 用途 |
| --- | --- | --- |
| Astro | 7.x | 静态站点生成 |
| @astrojs/starlight | 0.42.x | 文档主题、侧边栏、搜索 |
| starlight-blog | 0.29.x | 博客列表、分页、RSS |
| starlight-llms-txt | 0.11.x | 生成 llms.txt 及分类分卷 |

## 常用命令

```bash
pnpm install          # 安装依赖（Node >= 22）
pnpm dev              # 启动开发服务器
pnpm build            # 构建生产版本
pnpm preview          # 本地预览构建结果
pnpm check            # Astro 类型检查
pnpm check:content    # 内容门禁（代码块语言、内部结构、内网地址）
pnpm test:e2e         # Playwright 端到端测试（自动构建后起 preview 服务）
```

## 包管理器

项目以 **pnpm** 为标准：`pnpm-lock.yaml` 入库，CI 用 `--frozen-lockfile` 安装
（缓存命中时约 2 秒），贡献者统一使用 pnpm 以保证依赖树一致。

本机环境若 `pnpm install` 在链接阶段被安全策略拦截，可改用 bun 安装依赖：

```bash
pnpm install --lockfile-only   # 只生成锁文件，写库仍以 pnpm-lock.yaml 为准
bun install                    # 生成本地 node_modules
bun run dev                    # 或 bun run build / bunx playwright test
```

`bun.lock` 已在 `.gitignore` 中：它只是本机安装产物，不参与版本控制，
以免与 `pnpm-lock.yaml` 双轨漂移。切换包管理器需同时调整锁文件策略、
`pnpm.overrides` 与三个 workflow，变更成本高于收益（实测 `astro build`
bun 14.1s / pnpm 15.1s，CI 安装已无瓶颈）。

## 目录结构

| 路径 | 内容 |
| --- | --- |
| `src/content/docs/zh-cn/` | 全部文档，按分类分子目录 |
| `src/content/i18n/` | 界面文案，按 BCP-47 语言标记命名 |
| `src/content.config.ts` | 内容集合定义与 schema 扩展 |
| `src/components/` | 覆写与新增的 Starlight 组件 |
| `src/pages/` | 自定义路由：`/raw/**` Markdown 原文、`sitemap-ai.xml` |
| `src/lib/` | 与内容集合 id 相关的路径换算 |
| `public/` | 静态资源，直接复制到产物根目录 |
| `scripts/` | 内容迁移、内容门禁、Cloudflare 与 Weblate 运维脚本 |
| `adr/` | 架构决策记录，按 `YYYY-MM-DD-主题.md` 命名 |

## 语言与 URL

内容按语言分目录，当前只有默认语言 `zh-cn`。全站 URL 均带 `/zh-cn/` 前缀。
新增语言时在 `astro.config.mjs` 的 `locales` 中追加条目，无需改动内容结构。

两条由框架实现决定的约束：

1. **locale 键必须与内容目录名的小写形式一致。** Astro 会把内容集合的 `entry.id`
   整体小写化，Starlight 以 `entry.id.startsWith(`${locale}/`)` 判定条目归属。键名
   含大写字母时该语言的页面不会被生成，且 `starlight-blog` 会在构建期报
   `Failed to get blog configuration`。语言标记另按 BCP-47 写在 `lang` 字段，
   例如目录 `zh-cn` 对应 `lang: 'zh-CN'`。
2. **只声明已有译文目录的语言。** Starlight 会为已声明但缺译文的语言复制一份源语言
   页面作为回退，产生正文完全相同的重复内容；`starlight-blog` 在这类回退路由上无法
   解析条目 id，构建会直接失败。

`redirects` 只保留 `/` → `/zh-cn/` 一条：默认语言带前缀时框架不再生成站点根索引，
该条用于保证域名根路径可用。旧 URL 不做逐条映射，已收录链接交由页面 canonical 与
`sitemap-ai.xml` 收敛。

## 内容与 front matter

- 新文档放入 `src/content/docs/zh-cn/` 下对应分类子目录，侧边栏由目录结构自动推导；
- `title` 可选：未声明时由 `src/content.config.ts` 中的自定义 loader 从首个一级标题
  推导，无一级标题时回退为文件名。schema 中它**必须**保持可选：Astro 在 `docsLoader`
  内部（glob loader）就按 schema 校验 front matter，早于本站 loader 的补齐，声明为
  必填会让所有未写 front matter 的文档在构建期校验失败；下游页面取值时按可选处理；
- 博客条目（`<语言目录>/blog/**`，starlight-blog 的路径约定）由同一 loader 置
  `sidebar.hidden`：它们寄居在 docs 集合，若不摘除会同时出现在文档侧边栏与 Starlight
  的文档分页里，与插件自己的上下篇导航冲突，见
  `adr/2026-10-13-博客条目退出文档侧边栏.md`；
- 侧边栏无需手动配置，`astro.config.mjs` 未声明 `sidebar`。

## 面向 AI 的产物

| 产物 | 说明 |
| --- | --- |
| `/raw/<entry id>.md` | 每篇文档的 Markdown 原文，页面通过 `alternate` 链接暴露 |
| `/llms.txt`、`/_llms-txt/*.txt` | 全站索引与分类分卷，供上下文有限的客户端按需取用 |
| `/sitemap-ai.xml` | 只收录默认语言页面的站点地图，供 Cloudflare AI Search 抓取 |
| `AiAsk.astro` | 全站问答的右下角悬浮入口，经 `PageFrame.astro` 挂到每个页面 |
| `PaletteSelect.astro` / `palettes.css` | 导航栏的配色切换器与三套配色（Vitesse / Nord / Flexoki） |
| `starlight-theme-black` | 全站视觉主题：排版、导航、代码块（Expressive Code vesper 主题）、Geist 字体 |

AI 问答调用 NLWeb 的 `/ask` 接口，默认地址为
`https://bold-union-4896-nlweb.iuinin666.workers.dev/ask`，
可用 `PUBLIC_NLWEB_ASK_URL` 覆盖。

## MCP

- 项目级配置文件：`.claude/settings.json`
- 已接入服务：`cloudflare-ai-search`
- MCP endpoint：`https://b9b71958-6156-440e-a28f-b4105ff6a50c.search.ai.cloudflare.com/mcp`
- 使用说明：`src/content/docs/zh-cn/ai/mcp/modelcontextprotocol/servers/cloudflare-ai-search/doc.md`

## 部署与自动化

- `ci.yml`：推送 main 后构建并部署到 GitHub Pages；
- `e2e.yml`：PR 变更 `src/**`、`tests/e2e/**`、`astro.config.mjs` 等路径时，
  对构建产物跑 Playwright 用例（`pnpm test:e2e`）。只在 PR 触发，push main 不重复跑，
  因此合并到 main 的改动以本地或 PR 阶段的这次运行为准；
- `typecheck.yml`：PR 变更 `src/**`、`astro.config.mjs`、`tsconfig.json`、依赖清单时跑
  `pnpm check`（`astro check`，先 `astro sync` 生成集合类型）。与 e2e.yml 分开是为了
  让类型错误与端到端失败各自成一条信号，当前基线为 0 错误；
- `content-check.yml`：对变更的 Markdown 运行 `scripts/check-content.py`，需完整安装
  依赖以便读取 Shiki 的语言清单；
- `ai-search-sync.yml`：周期性触发 Cloudflare AI Search 同步；
- `ai-search-config.yml`：手动操作 Cloudflare AI Search 实例，三种模式：
  `update` 应用完整配置、`tune` 只调检索参数（不触发重索引，可传
  `keyword_match_mode` 与 `score_threshold`）、`recreate` 删除实例后重建
  （需输入实例名 `bold-union-4896` 确认）。

## 翻译

翻译平台迁移至 Weblate 的工作已暂缓，原因与恢复条件见
`adr/2026-09-10-翻译平台迁移至 Weblate.md`。组件与种子文件脚本
（`scripts/weblate-create-components.sh`、`scripts/weblate-seed-translations.sh`）已就绪，
源目录为 `src/content/docs/zh-cn/`。

界面文案位于 `src/content/i18n/`，按 BCP-47 语言标记命名，目前人工维护。
`locales` 只声明了 `zh-cn`，因此仅 `zh-CN.json` 会被加载；`en.json`、`ja.json`、
`zh-TW.json` 为已完成的译文，保留供新增语言时直接复用，不属于无用文件。

## 约定

- 提交信息使用约定式提交（Conventional Commits）：`feat:` / `fix:` / `refactor:` /
  `chore:` / `docs:`；
- 架构决策写入 `adr/`，决策发生变更时在原文档内标注变更日期与新的取值，避免多处
  描述不一致；
- 内容迁移与批量改写通过 `scripts/` 下的脚本完成，脚本需具备幂等性。

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
