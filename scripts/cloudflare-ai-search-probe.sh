#!/usr/bin/env bash
# 用一组查询样本调用 AI Search 的 search 接口，输出各查询的命中数。
#
# 与 NLWeb 的 /ask 的区别：/ask 经过生成模型与 NLWeb 自身的处理，
# 命中为空时无法区分问题出在检索层还是对话层。本脚本直接请求检索接口，
# 用于定位召回缺失发生在哪一层。
#
# 前置条件：
#   - API 令牌需具备 Account > AI Search:Edit 与 AI Search:Run 两项权限；
#   - 令牌通过 CLOUDFLARE_API_TOKEN 环境变量传入，不写入仓库。
#
# 用法：
#   export CLOUDFLARE_API_TOKEN=xxxx
#   ./scripts/cloudflare-ai-search-probe.sh
#
# 可用环境变量覆盖默认值：
#   CLOUDFLARE_ACCOUNT_ID  账户 ID
#   INSTANCE_ID            实例名
#   PROBE_QUERIES          查询样本，每行一条
#
# 退出码：
#   0  全部查询完成（无论命中数）

set -euo pipefail

: "${CLOUDFLARE_API_TOKEN:?需要设置 CLOUDFLARE_API_TOKEN}"

# 账号、实例与站点地址的默认值集中在 scripts/cloudflare-env.sh（审查项 M8）
source "$(dirname "$0")/cloudflare-env.sh"
BASE="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai-search/instances/${INSTANCE_ID}"
AUTH="Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"

# 样本覆盖四类：纯英文标识符、纯中文、中英混合、正文中不存在的词（对照组）。
# 查询本身不含双引号，直接用 printf 拼装 JSON 即可。
DEFAULT_QUERIES="proxy_pass
Redis
持久化
集群部署
Redis 持久化
Nginx 缓存配置
不存在的词条"
PROBE_QUERIES="${PROBE_QUERIES:-$DEFAULT_QUERIES}"

echo "==> 检索接口探测（实例 ${INSTANCE_ID}）"

printf '%s\n' "$PROBE_QUERIES" | while read -r query; do
  [ -z "$query" ] && continue

  body=$(
    printf '{"query":"%s","ai_search_options":{"retrieval":{"keyword_match_mode":"or","max_num_results":10}}}' "$query"
  )
  payload=$(
    curl -sS -X POST "${BASE}/search" \
      -H "$AUTH" -H 'Content-Type: application/json' \
      -d "$body" --max-time 60 || echo ''
  )

  printf '    %-20s ' "$query"
  PAYLOAD="$payload" python3 -c 'import json, os, sys
raw = os.environ.get("PAYLOAD") or ""
try:
    data = json.loads(raw)
except Exception:
    print("（解析失败）", raw[:120])
    sys.exit(0)
if not data.get("success"):
    print("（接口返回失败）", str(data.get("errors"))[:160])
    sys.exit(0)
chunks = (data.get("result") or {}).get("chunks") or []
print("命中 " + str(len(chunks)))'
done

echo
echo "==> 完成。对照 NLWeb /ask 的同一组查询可判断召回缺失发生在哪一层。"
