#!/bin/bash
set -euo pipefail  # 严格错误检查

# 定义JSON配置文件路径
CONFIG_FILE="./arthas_ports.json"

# 检查jq工具是否安装
check_jq() {
    if ! command -v jq &> /dev/null; then
        echo "错误: 需要安装jq工具来解析JSON文件" >&2
        echo "安装方法: brew install jq 或 apt-get install jq" >&2
        exit 1
    fi
}

# 检查配置文件是否存在
check_config_file() {
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "错误: 配置文件 $CONFIG_FILE 不存在" >&2
        exit 1
    fi
}

# 验证JSON文件格式是否有效
validate_json() {
    if ! jq . "$CONFIG_FILE" > /dev/null 2>&1; then
        echo "错误: JSON配置文件格式无效，请检查文件语法" >&2
        exit 1
    fi
}

# 通过服务名获取对应端口的函数
get_arthas_port() {
    local service_name="$1"
    if [ -z "$service_name" ]; then
        echo "服务名不能为空" >&2
        return 1
    fi

    # 使用jq从JSON文件中获取端口
    local port=$(jq -r --arg service "$service_name" '.[$service]' "$CONFIG_FILE")

    # 检查是否找到有效端口
    if [ "$port" == "null" ] || [ -z "$port" ]; then
        echo "未找到服务 $service_name 对应的Arthas端口" >&2
        return 1
    fi

    echo "$port"
    return 0
}

# 显示使用帮助
usage() {
    echo "使用方法: $0 <服务名>"
    echo "环境变量支持: REMOTE_SERVER (默认: xxx.dev.iuin)"
    echo "示例: $0 order-service"
    exit 1
}

# 主流程
check_jq
check_config_file
validate_json  # 新增JSON格式验证步骤

# 检查参数
if [ $# -ne 1 ]; then
    usage
fi

SERVICE_NAME="$1"

# 处理远程服务器配置
REMOTE_SERVER="${REMOTE_SERVER:-xxx.dev.iuin}"

# 获取服务对应的arthas端口
echo "获取服务 $SERVICE_NAME 的Arthas端口..."
ARTHAS_PORT=$(get_arthas_port "$SERVICE_NAME") || exit 1

echo "成功获取端口: $ARTHAS_PORT"
echo "正在连接到 $REMOTE_SERVER 的Arthas服务 ($SERVICE_NAME)..."
echo "连接后可直接进行交互，退出请使用 exit 命令"
echo "----------------------------------------"

# 修复非交互式环境下的SSH连接问题
# 使用-t分配伪终端，即使stdin不是终端
ssh -t "$REMOTE_SERVER" "telnet localhost $ARTHAS_PORT"

echo "与 $SERVICE_NAME 的Arthas连接已关闭"
