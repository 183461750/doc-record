# Cloudflare 配置

本文档记录站点在 Cloudflare 上的既有资源与配置步骤。

## 1. 既有资源

| 项目 | 值 |
| --- | --- |
| 账户 ID | `1e41ba8d32af254e50ca2f65292adfe1` |
| Workers 子域 | `iuinin666` |
| DNS 区域 | `iuin888vip.icu`（站点域名的上级域，已托管在 Cloudflare） |
| NLWeb Worker | `bold-union-4896-nlweb`，对外地址 `https://bold-union-4896-nlweb.iuinin666.workers.dev/` |
| AI Search 实例 | `bold-union-4896`（由 NLWeb 的 `RAG_ID` 绑定决定，改名需同步改绑定） |

NLWeb 自带聊天界面、`/ask` 接口与 MCP 支持，实例已在线。索引方式于 2026-09-15 切换为
关键词单路，原因与分阶段安排见 §3.3，容量限制的归因见 §4 与
`adr/2026-09-14-AI-Search-容量限流调优.md`。

## 2. 创建 API 令牌

AI Search 的接口要求令牌具备 **AI Search:Edit** 与 **AI Search:Run** 两项权限，
通用令牌默认不包含。

1. 进入 <https://dash.cloudflare.com/profile/api-tokens>；
2. 选择 **Create Token** → **Create Custom Token**；
3. Permissions 中添加两项：
   - Account > **AI Search** > Edit
   - Account > **AI Search** > Run

部署问答生成端（§5.2）需要另外三项：

   - Account > **Workers Scripts** > Edit
   - Account > **Account Settings** > Read
   - User > **Memberships** > Read

其中 **Memberships 属于 User 分组**，不在 Account 分组内：令牌创建页的权限分
Account / Zone / User 三组，只在前两组添加会漏掉这一项。

缺少 Workers Scripts 权限时 `wrangler deploy` 报
`A request to the Cloudflare API (.../workers/scripts/...) failed` 与
`Authentication error [code: 10000]`；缺少 Memberships 权限时会提示
`Unable to get membership roles`。三项齐备后部署可在约一分钟内完成。

> 排查提示：编辑 Cloudflare 令牌的权限不会改变令牌值，因此仓库密钥的
> `updated_at` 不会变化。可用
> `gh api repos/iuin8/doc-record/actions/secrets` 查看该时间戳：
> 时间戳不变并不代表权限未生效，判断依据是重新部署是否仍报 10000。

4. 其余权限保持默认（不需要 Zone 权限即可完成索引配置）；
5. 创建后复制令牌值。

令牌只在执行脚本时通过环境变量传入，不要写入仓库。

## 3. 配置 AI Search 索引

```bash
export CLOUDFLARE_API_TOKEN=xxxx
./scripts/cloudflare-ai-search-setup.sh
```

脚本完成三件事：写入实例配置、触发同步任务、轮询任务状态直到完成。

配置项说明：

| 配置 | 取值 | 原因 |
| --- | --- | --- |
| 数据源类型 | `web-crawler` | 站点为静态站，无对象存储清单可用 |
| URL 发现 | `parse_type: sitemap` + `sitemap-ai.xml` | 仅含根语言页面，避免回退副本成倍重复 |
| 向量模型 | `@cf/qwen/qwen3-embedding-0.6b` | 轻量多语言模型，索引成本低 |
| 生成模型 | `@cf/qwen/qwen3-30b-a3b-fp8` | 中文表现较好，可用环境变量覆盖 |
| 索引方式 | 关键词单路 + `trigram` 分词 | 向量索引受 Workers AI 嵌入产能限制，先以关键词建立全量覆盖，见 §3.3 |
| 分块 | 1024 token，重叠 10% | `chunk_size` 以 token 计，下限 64；`chunk_overlap` 为百分比，取值 0–30 |
| 同步间隔 | 21600 秒 | 与 GitHub Pages 的发布节奏匹配 |

排除项：

- `/raw/**`、`/_llms-txt/**`：面向 AI 的纯文本副本，与页面内容重复。

内容迁移到语言目录后，全站 URL 带 `/zh-cn/` 前缀，`sitemap-ai.xml` 只收集该前缀下的
条目，未声明的语言不会生成回退副本，因此不再需要按语言前缀排除。后续新增语言且译文
不全时，需在 `exclude_items` 中补上对应前缀。

### 3.1 为什么需要独立的站点地图

`sitemap-index.xml` 指向的 `sitemap-0.xml` 在迁移前含 1492 条 URL，其中约四分之三是
`/en`、`/ja`、`/zh-Hant` 前缀的回退副本，正文与根语言页面完全一致。全量索引会带来
两个问题：向量写入量放大约四倍，且 `max_num_results` 的返回名额被近义重复块占满，
实际可提供的独立来源显著减少。

内容迁入 `src/content/docs/zh-cn/` 并只声明该语言后，回退副本不再生成，
`sitemap-0.xml` 与 `sitemap-ai.xml` 的条目数已收敛到同一量级。条目数随内容增长，
这里不再写死（此前记录的「约 373 条」已滞后），核对方式：

```bash
curl -s https://doc-record.iuin888vip.icu/sitemap-ai.xml | grep -c '<loc>'
```

### 3.2 更换内容源需要重建实例

修改 `specific_sitemaps` 不会重置已经入队的 URL 列表，正在进行的同步任务会继续
消费旧队列。切换到新站点地图的可靠做法是删除实例后按新配置重新创建。

重建入口有两个，凭据均为仓库密钥 `CLOUDFLARE_API_TOKEN`：

```bash
# 本地执行
export CLOUDFLARE_API_TOKEN=xxxx
RECREATE=true ./scripts/cloudflare-ai-search-setup.sh

# 或在 GitHub Actions 手动触发 AI Search Config 工作流，
# mode 选 recreate，并输入实例名 bold-union-4896 作为确认
```

脚本默认行为是更新配置（PUT），适用于模型、分块、索引方式、排除项等不影响
URL 集合的调整；`RECREATE=true` 会先删除实例（含已入队 URL 与向量索引）再重新创建。

站点 URL 整体增加 `/zh-cn/` 前缀后，索引中的旧地址已全部失效且不再有跳转，
重建前检索结果会包含这些失效条目。重建时机应在新版本部署完成之后。

### 3.3 分阶段索引：先关键词，后向量

向量索引依赖 Workers AI 的嵌入产能。免费层在高峰期的容量限制（错误码 3040）使
全量同步的完成率长期为 0：2026-09-15 03:05 UTC 的一次同步中，队列 207、
失败 160，其中 159 条为容量不足，向量数为 0。

关键词索引构建 BM25 倒排表，不经过嵌入模型，因此不受该限制约束。索引分两个阶段：

| 阶段 | `index_method` | `keyword_tokenizer` | 目标 | 检索能力 |
| --- | --- | --- | --- | --- |
| A（当前） | `{keyword: true, vector: false}` | `trigram` | 全站覆盖 | 关键词与子串匹配，无语义召回 |
| B | `{keyword: true, vector: true}` | `trigram` | 增量补齐向量 | 关键词与语义混合检索 |

切换方式（脚本已提供对应环境变量，切换会触发一次全量重索引）：

```bash
# 阶段 B：在关键词索引之上补入向量
export CLOUDFLARE_API_TOKEN=xxxx
INDEX_VECTOR=true ./scripts/cloudflare-ai-search-setup.sh
```

阶段 A 的代价是失去语义召回：「容器怎么固定 IP」这类不出现关键词的问法仍会落空。
是否进入阶段 B 取决于嵌入产能是否宽松，判据为同步脚本输出的失败分类中
容量类错误是否归零。

**分词器字段位置**：`keyword_tokenizer` 必须写在 `indexing_options` 内。
置于顶层时接口返回 2xx 但静默丢弃，实例回读始终为 `porter`。
porter 是英文词级分词，对无空格的中文基本无效，表现为英文与标识符可命中、
纯中文查询全部落空。详见 `adr/2026-09-14-AI-Search-容量限流调优.md` §6.3。

### 3.4 检索侧参数

`retrieval_options.keyword_match_mode` 与 `score_threshold` 只影响查询期行为，
不触发重索引、不改数据源，可随时改回。

| 参数 | 实例默认 | 当前取值 | 说明 |
| --- | --- | --- | --- |
| `retrieval_options.keyword_match_mode` | `and` | `or` | `and` 要求所有查询词共现于同一文档，索引未收敛时多词查询直接为空 |
| `score_threshold` | 0.4 | 0.2 | 相关性下限，越低召回越宽、噪音越多 |

调整入口（不触发重索引）：

```bash
# 本地执行
export CLOUDFLARE_API_TOKEN=xxxx
SCORE_THRESHOLD=0.2 KEYWORD_MATCH_MODE=or ./scripts/cloudflare-ai-search-tune-retrieval.sh

# 或在 GitHub Actions 手动触发 AI Search Config 工作流，mode 选 tune
```

`context_expansion`（命中块向邻近块扩展）不在此列：它是单次请求参数
（`ai_search_options.retrieval`），实例级写入会被接口静默丢弃——回读时
`retrieval_options` 只剩 `keyword_match_mode`。NLWeb 的 `/ask` 不透传检索参数，
因此该能力当前无法启用。

实测对照见 `adr/2026-09-14-AI-Search-容量限流调优.md` §6.2。

## 4. 额度与容量说明

### 4.1 两类限制不可混为一谈

Workers AI 有两种性质不同的限制，均返回 HTTP 429，但语义相反：

| 错误码 | 含义 | 重试是否有效 | 缓解方式 |
| --- | --- | --- | --- |
| 3036 | Account limited，当日免费额度已用尽 | 无效，次日 00:00 UTC 重置 | 控制用量或升级付费 |
| 3040 | Out of capacity，当时无可用 GPU 承接请求 | 瞬时态，重试通常成功 | 错峰、降低并发、提升优先级 |

免费额度为每日 **10,000 Neurons**，每日 **00:00 UTC** 重置。Workers Paid 计划同样只含
这 10,000 Neurons，超出部分按 $0.011 / 1,000 Neurons 计费。

AI Search 侧报告的 `workers_ai_out_of_capacity_error` 对应 **3040**（瞬时容量不足），
**不是**额度耗尽。误判的代价在两侧均不对称：按 3036 处置会把可重试的 3040
当作当日不可恢复而放弃；按 3040 处置则会让额度已空的请求反复重排到次日。

### 4.2 已确认的现象

- 2026-09-11 08:30 UTC 直接调用 `@cf/qwen/qwen3-embedding-0.6b` 返回
  `you have used up your daily free allocation of 10,000 neurons`，属 3036；
- 同期索引任务出现 87 次 `workers_ai_out_of_capacity_error`，`completed` 为 0，
  属 3040。两者当天同时出现而成因不同，当时的记录把后者归因于前者，
  该判读已于 2026-09-14 更正；
- 2026-09-13 与 2026-09-14 两次同步的失败明细全部为
  `workers_ai_out_of_capacity_error`，触发时点处于额度重置之后且同期无其他调用，
  可排除 3036。

2026-09-11 当天额度耗尽的原因仍为此前的失控爬取：`sitemap-0.xml` 含 1492 条 URL，
且实例被反复重建与重试，同一批内容多次进入嵌入流程。切换到当时 367 条的根语言站点地图后，
单次全量索引的成本为：

| 项目 | 取值 |
| --- | --- |
| 根语言文档 | 368 篇，合计约 49.7 万字符 |
| 估算 token | 约 0.20 M |
| 嵌入单价 | 1075 neurons / M input tokens |
| 全量索引成本 | 约 214 neurons，占每日额度约 2% |
| 单次问答成本 | 约 60 neurons（8 段上下文 + 800 token 输出） |

额度充裕的结论仍然成立：全量索引约占每日额度 2%，即使每日重跑十次也仅约 20%。
因此**额度并非当前瓶颈**，是否升级 Workers Paid 取决于是否需要提升容量队列优先级，
而非需要更多额度。

### 4.3 应对方式

- 触发时机对 3040 的作用不在「是否在额度重置之后」，而在「是否避开免费层的嵌入高峰」；
  推荐改为每日多轮、间隔均匀的小批量轮次，见
  `adr/2026-09-14-AI-Search-容量限流调优.md` §5.4；
- 索引策略已按产能分阶段执行：2026-09-15 起 `index_method` 为关键词单路
  （`keyword: true, vector: false`），先建立全量覆盖；条件具备后再补齐向量，
  步骤见 §3.3，决策过程见 `adr/2026-09-14-AI-Search-容量限流调优.md` §5.1；
- 实例的 `sync_interval` 与外部工作流职责需要分离，避免同一批文件被两套机制反复重排；
- 避免重复索引仍属必要：内容源只用 `sitemap-ai.xml`，且不要频繁手动触发同步；
- 仓库需要在 Settings → Secrets 中配置 `CLOUDFLARE_API_TOKEN`，
  权限为 Account > AI Search:Edit 与 AI Search:Run。未配置时工作流跳过而不失败。

## 5. 站点接入

索引验证通过后，增加「AI 问答」入口。问答检索的是全站索引，不针对当前文档，
故入口不在标题区，而是做成右下角的全局悬浮面板（`src/components/AiAsk.astro`，
经 `PageFrame.astro` 挂到每个页面），并在面板内明示检索范围为全站。
文案沿用 i18n 机制，需同步补充四种语言的文案。

### 5.1 问答的两条链路

| 链路 | 召回位置 | 中文 | 说明 |
| --- | --- | --- | --- |
| 自建生成端（`cloudflare/ai-answer`） | 浏览器端 Pagefind | 可用 | 配置 `PUBLIC_AI_ANSWER_URL` 后启用，当前推荐 |
| NLWeb `/ask` | AI Search 关键词索引 | 不可用 | 未配置生成端时的回退 |

自建链路的分工：**召回在浏览器端完成，Worker 只做生成**。原因是 AI Search 的
关键词索引对中文不分词（trigram 同样无效），纯中文查询召回恒为 0；
NLWeb 的 `/ask` 还会在检索层有结果时把含中文的查询过滤为空，见
`adr/2026-09-14-AI-Search-容量限流调优.md` §6.3。

站点构建产物中的 Pagefind 索引中文分词可用，实测同一查询的召回数：

| 查询 | Pagefind（浏览器端） | AI Search 检索接口 |
| --- | --- | --- |
| `持久化` | 4 | 0 |
| `集群部署` | 16 | 0 |

### 5.1.1 中文长句的处理

Pagefind 对多个词要求同时命中同一文档，长句里只要有一个词与文档无关，结果就是 0。
实测「nsenter 的改动是持久化的吗」为 0，而拆出的词各自有命中：

| 查询 | 命中 |
| --- | --- |
| `nsenter` | 3 |
| `持久化` | 4 |
| `改动` | 6 |
| `nsenter 的改动是持久化的吗` | 0 |
| `nsenter 改动 持久化`（仅去虚词） | 0 |

因此单纯去掉虚词不足以解决，页面侧分两步处理：

1. 整句检索无结果时，用浏览器原生的 `Intl.Segmenter` 分词，剔除虚词与单字后
   逐词检索，再按 RRF 融合排名（只用名次，不同查询之间的分数不可比）。
   不支持该 API 的浏览器退回按空白切分，中文长句此时仍会落空，但不会报错；
2. 生成端只接收每片段前 1500 字符，若直接取正文开头，命中位置靠后的内容会被
   整个切掉 —— nsenter 页正文 3062 字符，「持久化」在第 2822 位，取开头会让模型
   只能回答「未在文档中找到相关内容」。改为在正文中按 500 字符步长滑动
   1500 字符窗口，取覆盖查询词最多的那一段。

整句有结果时不进入第 1 步，已有行为不变。实测同一长句返回
「nsenter 的改动是非持久化的，仅在命令执行期间生效，退出后恢复原有上下文 [1]。」

流程：页面 `import('/pagefind/pagefind.js')` 取回 top-K 片段 → 连同问题
提交给生成端 → 生成端用 Workers AI 一次性生成（非流式，原因见 §5.2），
页面渲染答案与来源链接。

成本：召回读静态文件，不消耗 Workers AI 额度；生成每次约 60 Neurons，
在每日 10,000 Neurons 的免费额度内。Workers Free 计划含 100,000 请求/日，
单账户可部署 100 个 Worker，均无需付费。

### 5.2 部署生成端

部署由 `.github/workflows/deploy-ai-answer.yml` 完成，凭据为仓库密钥
`CLOUDFLARE_API_TOKEN`（优先取专用的 `CLOUDFLARE_WORKERS_API_TOKEN`），
所需三项权限见 §2。工作流为手动触发：

```bash
gh workflow run deploy-ai-answer.yml --repo iuin8/doc-record --ref main
```

当前线上端点为 `https://doc-record-ai-answer.iuinin666.workers.dev`，
已在 `.github/workflows/ci.yml` 的构建步骤中配置为 `PUBLIC_AI_ANSWER_URL`，
页面构建后即切换到本地召回链路。地址非机密，端点侧另有来源校验。

`ALLOWED_ORIGIN` 与 `GENERATION_MODEL` 已在 `wrangler.toml` 的 `[vars]` 中声明，
Workers AI 绑定由 `[ai]` 声明，均随部署生效，无需在 Dashboard 另行配置。

**生成不用流式。** `qwen3-30b-a3b-fp8` 在流式输出下会吞掉数字：实测
「Redis 的默认监听端口为 6379」输出为「…为 []」，正文序号「4.」输出为「.」，
来源编号同样退化为 `[]`。改为 `stream: false` 后同一查询输出
「Redis 的默认监听端口为 6379 [1]。」，数字与编号均正确。代价是失去逐字输出，
用户需等待完整答案；答案受 `max_tokens: 800` 约束，等待时间在可接受范围。

**备选路径：Workers Builds 的 Git 集成。** 仓库密钥不具备 Workers 部署权限时，
可改由 Cloudflare 侧持有 GitHub 授权自行部署，不需要令牌，免费计划每月 3,000
构建分钟（[Workers Builds 限制](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)）。
Dashboard 配置：

| 配置项 | 取值 |
| --- | --- |
| Production branch | `main` |
| Root directory | `cloudflare/ai-answer` |
| Build command | 留空 |
| Deploy command | `npx --yes wrangler@4 deploy` |

另需在 **Settings → Build → Variables and Secrets** 增加 `SKIP_DEPENDENCY_INSTALL=true`。
构建环境按仓库根 `package.json` 的 `packageManager`（`pnpm@10.26.2`）判定包管理器，
却在 Root directory 内执行安装命令，而该目录没有 pnpm 锁文件，安装阶段即报
`ERR_PNPM_NO_LOCKFILE`。本 Worker 无运行时依赖，跳过安装后由 `npx` 自行拉取 wrangler。

两条路径争用同一个 Worker 名称，**只保留一条**：采用 GitHub Actions 时，
需断开 Workers Builds 中已连接的仓库，否则推送 `main` 会触发重复部署。

**本地预检**：配置本身是否可被 wrangler 正确解析，无需令牌即可验证：

```bash
cd cloudflare/ai-answer && npx wrangler deploy --dry-run
```

输出应列出 `env.AI`、两个变量与约 6.7 KiB 的 Total Upload。此步报错说明问题在配置；
此步通过而部署仍失败，则失败环节在构建环境或上传凭据，需查 Cloudflare 侧的构建日志。

### 5.3 生成端的防护

- 仅接受来自 `ALLOWED_ORIGIN` 的跨域请求，预检请求独立处理；
  取值为逗号分隔的来源清单，按相等比较匹配（前缀匹配会被同前缀的第三方域名绕过）。
  站点若同时经其他域名访问，需在该清单中补齐；
- 限制请求体大小、片段数量（6）与单片段长度（1500 字符），控制 prompt 规模；
- 片段 URL 必须以站点域名开头，避免被当作通用生成代理；
- 未携带有效片段时返回 400，不进入生成阶段。

## 6. Weblate 与 Cloudflare 的分工

Weblate 是重状态应用，需要持久文件系统、PostgreSQL、Valkey 与常驻任务队列，
**不适合部署在 Cloudflare**（Containers 的磁盘全部为临时盘，且无持久卷与 shell）。

Cloudflare 在这个方案里承担的是外围能力：

- **Cloudflare Tunnel**：发布自建 Weblate，无需开放任何入站端口，可叠加 Zero Trust 访问控制；
- **R2**：存放 `DATA_DIR` 与数据库备份，可配置生命周期规则；
- **DNS**：域名已托管在 Cloudflare，解析直接可用。

具体部署步骤见 `weblate/README.md`。
