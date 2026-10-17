#!/usr/bin/env bash
# Cloudflare 账号与 AI Search 实例的单一来源（代码审查发现项 M8）。
#
# 用法：在脚本里 `source "$(dirname "$0")/cloudflare-env.sh"`。所有取值都支持同名环境
# 变量覆盖，脚本中不要再写一份默认值 —— 改实例名或账号时只改这一处。
#
# 这些标识符不是密钥：账户 ID 与实例名出现在公开文档与 URL 中。令牌仍只经
# `CLOUDFLARE_API_TOKEN` 传入，不写入仓库。
#
# 另提供 `json_string`（代码审查发现项 L6）：heredoc 里直接插值变量的写法，在取值含
# 双引号、反斜杠或换行时会拼出非法 JSON。

CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-1e41ba8d32af254e50ca2f65292adfe1}"
INSTANCE_ID="${INSTANCE_ID:-bold-union-4896}"
# Workers 子域：NLWeb 入口为 https://<实例名>-nlweb.<子域>.workers.dev/
WORKERS_SUBDOMAIN="${WORKERS_SUBDOMAIN:-iuinin666}"
# 站点来源：AI Search 的抓取目标与 sitemap 基准
SITE_URL="${SITE_URL:-https://doc-record.iuin888vip.icu}"

# 把任意字符串转成合法的 JSON 字符串字面量（含首尾引号与必要转义）。
# 输出已带引号，调用处不要再给插值加引号。
json_string() {
  if ! command -v jq >/dev/null 2>&1; then
    echo '错误：需要 jq 生成 JSON，请先安装（CI 的 ubuntu-latest 已自带）。' >&2
    return 2
  fi
  jq -Rn --arg value "$1" '$value'
}
