#!/usr/bin/env bash
# 调整 AI Search 实例的检索侧参数（不触发重新索引）。
#
# 与 cloudflare-ai-search-setup.sh 的区别：本脚本只改查询期行为，
# 不触碰数据源、嵌入模型与分块配置，因此不会触发全量重索引，
# 可以随时改回，适用于索引尚未收敛时的召回调优。
#
# 背景见 adr/2026-09-14-AI-Search-容量限流调优.md §5.6：
# keyword_match_mode 默认为 and，要求所有查询词都命中同一文档，
# 在索引覆盖不完整时，多词查询会直接返回空结果。
#
# 前置条件：
#   - API 令牌需具备 Account > AI Search:Edit 与 AI Search:Run 两项权限；
#   - 令牌通过 CLOUDFLARE_API_TOKEN 环境变量传入，不写入仓库。
#
# 用法：
#   export CLOUDFLARE_API_TOKEN=xxxx
#   ./scripts/cloudflare-ai-search-tune-retrieval.sh
#
# 可用环境变量覆盖默认值：
#   CLOUDFLARE_ACCOUNT_ID  账户 ID
#   INSTANCE_ID            实例名
#   KEYWORD_MATCH_MODE     and | or，默认 or
#   SCORE_THRESHOLD        0-1，默认 0.2（实例默认 0.4）
#   DRY_RUN                设为 1 时只打印变更对照，不写入

set -euo pipefail

: "${CLOUDFLARE_API_TOKEN:?需要设置 CLOUDFLARE_API_TOKEN}"

# 账号、实例与站点地址的默认值集中在 scripts/cloudflare-env.sh（审查项 M8）
source "$(dirname "$0")/cloudflare-env.sh"
KEYWORD_MATCH_MODE="${KEYWORD_MATCH_MODE:-or}"
SCORE_THRESHOLD="${SCORE_THRESHOLD:-0.2}"
DRY_RUN="${DRY_RUN:-0}"

BASE="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai-search/instances/${INSTANCE_ID}"
AUTH="Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"

echo "==> 读取当前配置"
current="$(curl -fsS "${BASE}" -H "$AUTH")" || {
  echo "    取回配置失败" >&2
  exit 1
}

echo "$current" | python3 -c '
import sys, json
d = json.load(sys.stdin)["result"]
ro = d.get("retrieval_options") or {}
print("    keyword_match_mode:", ro.get("keyword_match_mode", "（未设置，回退为 and）"))
print("    score_threshold:   ", d.get("score_threshold", "（未设置，回退为 0.4）"))
print("    index_method:      ", d.get("index_method"))
print("    retrieval_options: ", json.dumps(ro, ensure_ascii=False))
# keyword_tokenizer 位于 indexing_options 内；置于顶层时接口返回 2xx 但不落库，
# 打印实际取值可确认当前生效的分词器。
print("    indexing_options:  ", json.dumps(d.get("indexing_options"), ensure_ascii=False))
'

echo
echo "==> 拟写入"
cat <<EOF
    retrieval_options.keyword_match_mode = ${KEYWORD_MATCH_MODE}
    score_threshold                      = ${SCORE_THRESHOLD}
EOF

if [ "$DRY_RUN" = "1" ]; then
  echo
  echo "    DRY_RUN=1，未写入。"
  exit 0
fi

# context_expansion 只能作为单次请求参数传入（ai_search_options.retrieval），
# 实例级写入会被接口静默丢弃：回读时 retrieval_options 只剩 keyword_match_mode。
# NLWeb 的 /ask 不透传检索参数，因此该能力当前无法启用，脚本不再写入。
body=$(
  cat <<EOF
{
  "retrieval_options": { "keyword_match_mode": $(json_string "${KEYWORD_MATCH_MODE}") },
  "score_threshold": ${SCORE_THRESHOLD}
}
EOF
)

echo
echo "==> 提交更新"
curl -fsS -X PUT "$BASE" -H "$AUTH" -H 'Content-Type: application/json' -d "$body" >/dev/null

echo
echo "==> 回读确认"
curl -fsS "${BASE}" -H "$AUTH" | python3 -c '
import sys, json
d = json.load(sys.stdin)["result"]
ro = d.get("retrieval_options") or {}
print("    keyword_match_mode:", ro.get("keyword_match_mode"))
print("    score_threshold:   ", d.get("score_threshold"))
print("    retrieval_options: ", json.dumps(ro, ensure_ascii=False))
'

echo
echo "==> 完成。建议用多组查询词复验命中变化："
echo "    curl -sS -X POST https://${INSTANCE_ID}-nlweb.${WORKERS_SUBDOMAIN}.workers.dev/ask \\"
echo "      -H 'Content-Type: application/json' -d '{\"query\":\"Docker 安装 Redis\",\"mode\":\"list\"}'"
