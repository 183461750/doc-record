#!/usr/bin/env bash
# 配置 Cloudflare AI Search（原 AutoRAG）实例，为站点提供检索增强问答。
#
# 前置条件：
#   - API 令牌需具备 Account > AI Search:Edit 与 AI Search:Run 两项权限；
#   - 站点已发布且 sitemap 可访问。
#
# 用法：
#   export CLOUDFLARE_API_TOKEN=xxxx
#   ./scripts/cloudflare-ai-search-setup.sh
#
# 可用环境变量覆盖默认值：
#   CLOUDFLARE_ACCOUNT_ID  账户 ID
#   INSTANCE_ID            实例名，需与 NLWeb Worker 的 RAG_ID 绑定一致
#   SITEMAP_PATH           站点地图路径，默认 sitemap-ai.xml
#   RECREATE               设为 true 时先删除实例再重建，默认 false
#   RERANKING              是否启用重排，默认 false（免费额度下减少模型调用）
#   REWRITE_QUERY          是否启用查询改写，默认 false（同上）
#   EMBEDDING_MODEL        向量模型
#   AI_SEARCH_MODEL        生成模型
#   INDEX_KEYWORD          是否建立关键词索引，默认 true
#   INDEX_VECTOR           是否建立向量索引，默认 false（分阶段索引的当前阶段）
#   KEYWORD_TOKENIZER      关键词分词器，默认 trigram
#   RETRIEVAL_MATCH_MODE   检索期关键词匹配模式，and | or，默认 or
#   SCORE_THRESHOLD        相关性下限，0-1，默认 0.2（实例默认 0.4）
#
# RECREATE 的适用场景：已入队 URL 列表不会随 `specific_sitemaps` 变更而重置，
# 站点 URL 结构整体调整后，失效条目会继续占据检索名额，需删除实例后重建。
# 更新配置（默认行为）适用于模型、分块、排除项等不影响 URL 集合的调整。
#
# 分阶段索引：向量索引依赖 Workers AI 的嵌入产能，免费层在高峰期持续返回
# 错误码 3040（out of capacity），实测多次全量同步的完成率长期为 0。
# 关键词索引构建 BM25 倒排表，不经过嵌入模型，因此先以关键词单路建立全量覆盖；
# 待产能宽松后，再用 INDEX_VECTOR=true 切换到双路，由增量补齐向量。
# 切换 index_method 会触发全量重索引，两个阶段的切换都会重建一次索引。

set -euo pipefail

: "${CLOUDFLARE_API_TOKEN:?需要设置 CLOUDFLARE_API_TOKEN}"

# 账号、实例与站点地址的默认值集中在 scripts/cloudflare-env.sh（审查项 M8）
source "$(dirname "$0")/cloudflare-env.sh"
# sitemap-ai.xml 由 src/pages/sitemap-ai.xml.ts 生成，仅含根语言页面，
# 不含 /en /ja /zh-Hant 回退副本，避免索引内容成倍重复。
SITEMAP_PATH="${SITEMAP_PATH:-sitemap-ai.xml}"
EMBEDDING_MODEL="${EMBEDDING_MODEL:-@cf/qwen/qwen3-embedding-0.6b}"
AI_SEARCH_MODEL="${AI_SEARCH_MODEL:-@cf/qwen/qwen3-30b-a3b-fp8}"
RERANKING="${RERANKING:-false}"
REWRITE_QUERY="${REWRITE_QUERY:-false}"
# 关键词单路为分阶段索引的当前阶段，见文件头的分阶段说明。
INDEX_KEYWORD="${INDEX_KEYWORD:-true}"
INDEX_VECTOR="${INDEX_VECTOR:-false}"
KEYWORD_TOKENIZER="${KEYWORD_TOKENIZER:-trigram}"
# 检索侧参数与 cloudflare-ai-search-tune-retrieval.sh 的默认值保持一致：
# 完整配置写入是整体替换，此处若缺失会被重置回实例默认（and / 0.4）。
# 取值理由见 adr/2026-09-14-AI-Search-容量限流调优.md §5.6。
# context_expansion 不在此列：实例级写入会被接口静默丢弃，只能作为单次请求参数传入。
RETRIEVAL_MATCH_MODE="${RETRIEVAL_MATCH_MODE:-or}"
SCORE_THRESHOLD="${SCORE_THRESHOLD:-0.2}"

BASE="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai-search"
AUTH="Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"

api() {
  curl -fsS -H "$AUTH" -H 'Content-Type: application/json' "$@"
}

json_field() {
  python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(1)
cursor = data
for key in '$1'.split('.'):
    if isinstance(cursor, dict):
        cursor = cursor.get(key)
    elif isinstance(cursor, list) and key.isdigit():
        cursor = cursor[int(key)]
    else:
        cursor = None
    if cursor is None:
        break
print(cursor if cursor is not None else '')
"
}

echo "==> 查询实例 ${INSTANCE_ID}"
existing="$(api "${BASE}/instances/${INSTANCE_ID}" 2>/dev/null || echo '')"
if [ -n "$existing" ]; then
  echo "    实例已存在，转为更新配置"
  method=PUT
  url="${BASE}/instances/${INSTANCE_ID}"
else
  echo "    实例不存在，将创建"
  method=POST
  url="${BASE}/instances"
fi

if [ "${RECREATE:-false}" = "true" ] && [ -n "$existing" ]; then
  echo "==> RECREATE=true，删除实例 ${INSTANCE_ID}（含已入队 URL 与向量索引）"
  if api -X DELETE "${BASE}/instances/${INSTANCE_ID}" >/dev/null 2>&1; then
    echo "    已提交删除，等待实例状态收敛后再创建"
    deleted=false
    for attempt in $(seq 1 30); do
      sleep 10
      if ! api "${BASE}/instances/${INSTANCE_ID}" >/dev/null 2>&1; then
        echo "    实例已消失（第 ${attempt} 次检查）"
        deleted=true
        break
      fi
    done
    if [ "$deleted" != "true" ]; then
      echo "    删除后实例仍可查询，可能为接口延迟；继续尝试创建" >&2
    fi
    method=POST
    url="${BASE}/instances"
  else
    echo "    删除失败，请确认令牌具备 AI Search:Edit 权限" >&2
    exit 1
  fi
fi

# 排除项说明：
#   /raw/** 与 /_llms-txt/** 是给 AI 直接取用的纯文本副本，与页面内容重复。
#   站点当前只声明存在译文的语言，未声明的语言不会生成回退副本，无需在此排除。
#   后续新增语言且译文不全时，需在此补上对应前缀的排除项。
# source 为爬取源的根地址。API 文档将其标为可选，但创建 web-crawler 实例时
# 缺少该字段会被拒绝（错误码 7001：source is required for web-crawler instances）。
# keyword_tokenizer 取 trigram 而非默认的 porter：porter 是词级分词加 Porter 词干提取，
# 面向英文自然语言；本站内容为中文技术文档，含大量命令、配置项、报错串与标识符，
# 字符级子串匹配对此类字面串更直接。
# JSON 不支持注释，说明只能写在 heredoc 之外。
body=$(
  cat <<EOF
{
  "id": $(json_string "${INSTANCE_ID}"),
  "type": "web-crawler",
  "source": $(json_string "${SITE_URL}"),
  "source_params": {
    "web_crawler": {
      "parse_type": "sitemap",
      "parse_options": {
        "specific_sitemaps": [$(json_string "${SITE_URL}/${SITEMAP_PATH}")]
      },
      "discover_options": {
        "source": "sitemaps",
        "depth": 1,
        "limit": 100000,
        "include_external_links": false,
        "include_subdomains": false
      }
    },
    "exclude_items": ["/raw/**", "/_llms-txt/**"]
  },
  "embedding_model": "${EMBEDDING_MODEL}",
  "ai_search_model": "${AI_SEARCH_MODEL}",
  "chunk": true,
  "chunk_size": 1024,
  "chunk_overlap": 10,
  "index_method": { "keyword": ${INDEX_KEYWORD}, "vector": ${INDEX_VECTOR} },
  "indexing_options": { "keyword_tokenizer": "${KEYWORD_TOKENIZER}" },
  "retrieval_options": { "keyword_match_mode": "${RETRIEVAL_MATCH_MODE}" },
  "score_threshold": ${SCORE_THRESHOLD},
  "max_num_results": 10,
  "reranking": ${RERANKING},
  "rewrite_query": ${REWRITE_QUERY},
  "sync_interval": 21600
}
EOF
)

echo "==> 写入配置（${method} ${url}）"
# 不用 curl 的 -f：该选项在 HTTP 错误时丢弃响应体，而 AI Search 的校验细节
# 只在响应体里给出，看不到就无法判断是哪个字段或取值被拒。
result="$(
  curl -sS -H "$AUTH" -H 'Content-Type: application/json' \
    -X "$method" "$url" -d "$body" -w $'\n%{http_code}'
)"
status="$(printf '%s' "$result" | tail -n 1)"
payload="$(printf '%s' "$result" | sed '$d')"

case "$status" in
  2*) ;;
  *)
    echo "    写入失败，HTTP ${status}，接口返回：" >&2
    echo "$payload" >&2
    exit 1
    ;;
esac

# keyword_tokenizer 位于 indexing_options 内：置于顶层时接口返回 2xx 但不落库
# （回读仍为默认的 porter）。porter 是英文词级分词，对无空格的中文基本无效，
# 表现为英文与标识符可命中、纯中文查询全部落空。
# retrieval_options 同理，只接受 keyword_match_mode，不接受 context_expansion。
# 写入后回读确认，避免字段再次被静默丢弃。
echo "==> 回读确认"
curl -fsS "${BASE}/instances/${INSTANCE_ID}" -H "$AUTH" 2>/dev/null | python3 -c '
import sys, json
try:
    d = json.load(sys.stdin)["result"]
except Exception:
    print("    （回读失败，请在控制台确认）")
    sys.exit(0)
io = d.get("indexing_options") or {}
ro = d.get("retrieval_options") or {}
print("    index_method:      ", d.get("index_method"))
print("    keyword_tokenizer: ", io.get("keyword_tokenizer", "（未设置，回退为 porter）"))
print("    keyword_match_mode:", ro.get("keyword_match_mode", "（未设置，回退为 and）"))
print("    score_threshold:   ", d.get("score_threshold", "（未设置，回退为 0.4）"))
' || true

echo "==> 触发同步任务"
job="$(api -X POST "${BASE}/instances/${INSTANCE_ID}/jobs" 2>/dev/null || echo '')"
# 新建实例可能已自带一次同步，接口也可能暂时不可用；取不到任务 ID 时继续等待，
# 交由下面的轮询与 cloudflare-ai-search-sync.sh 观测，不因此中断。
job_id=""
if [ -n "$job" ]; then
  job_id="$(printf '%s' "$job" | json_field result.id || echo '')"
fi
echo "    任务 ID：${job_id:-（未返回，可在控制台查看）}"

echo "==> 等待索引完成"
for attempt in $(seq 1 30); do
  sleep 20
  status="$((api "${BASE}/instances/${INSTANCE_ID}/jobs" 2>/dev/null || echo '') |
    python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    jobs = data.get('result') or []
    print(jobs[0].get('status', 'unknown') if jobs else 'unknown')
except Exception:
    print('unknown')
")"
  echo "    [${attempt}] 状态：${status}"
  case "$status" in
    completed | success) echo "    索引完成"; break ;;
    failed | error) echo "    索引失败，请在控制台查看任务日志" >&2; exit 1 ;;
  esac
done

echo "==> 索引统计"
api "${BASE}/instances/${INSTANCE_ID}/stats" 2>/dev/null | head -c 400 || true
echo
echo "==> 完成。可用以下地址验证问答："
echo "    https://${INSTANCE_ID}-nlweb.${WORKERS_SUBDOMAIN}.workers.dev/"
