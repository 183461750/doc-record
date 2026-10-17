#!/usr/bin/env bash
# 触发 Cloudflare AI Search 同步任务，输出索引统计与失败分类。
#
# 与 cloudflare-ai-search-setup.sh 的区别：本脚本只触发同步与查询统计，
# 不修改实例配置，可安全地在 CI 中按计划重复执行。
#
# 失败分类的依据见 adr/2026-09-14-AI-Search-容量限流调优.md §2：
# workers_ai_out_of_capacity_error 对应 Workers AI 错误码 3040（瞬时容量不足），
# 重试通常有效；每日免费额度耗尽对应错误码 3036，重试无效。
# 不做区分时两类失败在索引统计中表现相同，无法判断是否需要人工介入。
#
# 前置条件：
#   - API 令牌需具备 Account > AI Search:Edit 与 AI Search:Run 两项权限；
#   - 令牌通过 CLOUDFLARE_API_TOKEN 环境变量传入，不写入仓库。
#
# 退出码：
#   0  正常完成（无论索引是否收敛）
#   1  无法取回索引统计
#
# 用法：
#   export CLOUDFLARE_API_TOKEN=xxxx
#   ./scripts/cloudflare-ai-search-sync.sh
#
# 可用环境变量覆盖默认值：
#   CLOUDFLARE_ACCOUNT_ID  账户 ID
#   INSTANCE_ID            实例名
#   SITEMAP_URL            根语言站点地图地址，用于估算全量块数
#   AVG_CHUNKS_PER_DOC     每篇文档的平均分块数

set -euo pipefail

: "${CLOUDFLARE_API_TOKEN:?需要设置 CLOUDFLARE_API_TOKEN}"

# 账号、实例与站点地址的默认值集中在 scripts/cloudflare-env.sh（审查项 M8）
source "$(dirname "$0")/cloudflare-env.sh"
SITEMAP_URL="${SITEMAP_URL:-https://doc-record.iuin888vip.icu/sitemap-ai.xml}"
# 1.66 取自 dist/raw 下 367 篇原文的实测估算：合计 493,614 字符，
# 按 chunk_size 1024 / overlap 10% 切分约得 611 块。
# 内容规模或分块参数变更后需要重算该系数。
# 关键词单路（index_method.vector=false）下不产生向量，覆盖率以「完成」条目数
# 占站点地图条目数的比例为准，向量数仅作参考输出。
AVG_CHUNKS_PER_DOC="${AVG_CHUNKS_PER_DOC:-1.66}"

BASE="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai-search/instances/${INSTANCE_ID}"
AUTH="Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"

echo "==> 触发同步任务"
job_id="$(
  curl -fsS -X POST "${BASE}/jobs" -H "$AUTH" -H 'Content-Type: application/json' |
    python3 -c 'import sys, json; print(json.load(sys.stdin)["result"]["id"])' 2>/dev/null || echo ''
)"
echo "    任务 ID：${job_id:-（未返回）}"

# 站点地图不可达时静默降级，仅跳过覆盖率输出，不阻断同步。
expected="$(
  curl -fsS --max-time 20 "${SITEMAP_URL}" 2>/dev/null |
    grep -c '<loc>' || echo 0
)"

echo "==> 索引统计"
stats="$(curl -fsS "${BASE}/stats" -H "$AUTH")" || {
  echo "    取回统计失败" >&2
  exit 1
}

echo "$stats" | EXPECTED_DOCS="$expected" AVG_CHUNKS="$AVG_CHUNKS_PER_DOC" python3 -c '
import json, os, sys

CAPACITY = {"workers_ai_out_of_capacity_error"}
TIMEOUT = {"workers_ai_timeout_error", "timeout_error"}

data = json.load(sys.stdin)["result"]
engine = data.get("engine") or {}
vectors = (engine.get("vectorize") or {}).get("vectorsCount") or 0

errors = data.get("file_embed_errors") or {}
capacity = sum(n for k, n in errors.items() if k in CAPACITY)
timeout = sum(n for k, n in errors.items() if k in TIMEOUT)
other = sum(n for k, n in errors.items() if k not in CAPACITY and k not in TIMEOUT)

print("    队列:   ", data.get("queued"))
print("    进行中: ", data.get("running"))
print("    完成:   ", data.get("completed"))
print("    失败:   ", data.get("error"))
print("    向量数: ", vectors)

docs = int(os.environ.get("EXPECTED_DOCS") or 0)
completed = data.get("completed") or 0
if docs > 0:
    print(f"    文档覆盖: {completed / docs:.1%}（完成 {completed} / 站点地图 {docs}）")
    avg = float(os.environ.get("AVG_CHUNKS") or 0)
    if avg > 0:
        total = docs * avg
        print(
            f"    向量覆盖: {vectors / total:.1%}（{vectors} / 估算 {total:.0f} 块，"
            f"按每篇 {avg} 块；关键词单路时恒为 0）"
        )
else:
    print("    覆盖率:   （站点地图不可达，已跳过估算）")

print()
print("==> 失败分类")
print(f"    容量不足（3040，可重试）:  {capacity}")
print(f"    超时（重试可能加重）:      {timeout}")
print(f"    未分类:                    {other}")
if other:
    print("    未分类明细:", {k: n for k, n in errors.items() if k not in CAPACITY and k not in TIMEOUT})

print()
print("==> 判读")
if capacity and not other:
    print("    瓶颈在 Workers AI 嵌入侧瞬时容量，与当日额度无关。")
    print("    适用手段：错峰多轮、切换索引关键词单路、提升容量优先级。")
    print("    参见 adr/2026-09-14-AI-Search-容量限流调优.md §5。")
    print("    若实例已切到关键词单路仍有此类失败，则瓶颈在 toMarkdown 转换环节，")
    print("    需改为 R2 直喂 Markdown（同文档 §5.3）。")
elif other:
    print("    存在未分类错误，需要先确认其性质再决定处置方式。")
else:
    print("    本轮无失败记录。")
'

echo
echo "==> 完成。问答入口：https://${INSTANCE_ID}-nlweb.${WORKERS_SUBDOMAIN}.workers.dev/"
