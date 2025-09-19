#!/bin/bash
set -x  # 输出所有执行的命令
set -euo pipefail  # 严格错误检查

# 配置参数处理 - 优先读取环境变量，其次使用命令行参数
# 环境变量: LOCAL_BASE_DIR, REMOTE_SERVER, REMOTE_BASE_DIR
if [ -z "$LOCAL_BASE_DIR" ]; then
    if [ $# -lt 1 ]; then
        echo "使用方法: $0 <本地服务目录> [服务名1] [服务名2] ..."
        echo "环境变量支持: LOCAL_BASE_DIR, REMOTE_SERVER, REMOTE_BASE_DIR"
        echo "示例1: 更新指定目录下的所有服务"
        echo "       $0 /path/to/services"
        echo "示例2: 只更新指定的服务"
        echo "       $0 /path/to/services pay-service order-service"
        exit 1
    fi
    LOCAL_BASE_DIR="$1"
    shift  # 移除目录参数，剩下的都是要更新的服务名
fi

# 处理远程服务器配置
REMOTE_SERVER="${REMOTE_SERVER:-xxx.dev.iuin}"
REMOTE_BASE_DIR="${REMOTE_BASE_DIR:-/data/xxx}"

# 检查本地目录是否存在
if [ ! -d "$LOCAL_BASE_DIR" ]; then
    echo "错误: 本地目录 $LOCAL_BASE_DIR 不存在"
    exit 1
fi

# 查找所有以-service结尾的子目录并提取服务名
ALL_SERVICE_DIRS=$(find "$LOCAL_BASE_DIR" -maxdepth 1 -type d -name "*-service")
ALL_SERVICES=$(basename -a $ALL_SERVICE_DIRS)

# 检查是否找到服务目录
if [ -z "$ALL_SERVICE_DIRS" ]; then
    echo "在 $LOCAL_BASE_DIR 中未找到以-service结尾的目录"
    exit 1
fi

# 显示所有可用服务
echo "可用的服务列表:"
echo "-------------------------"
printf "%s\n" "${ALL_SERVICES[@]}"
echo "-------------------------"

# 确定要更新的服务，如果未指定则更新所有
if [ $# -eq 0 ]; then
    SERVICES_TO_UPDATE=($ALL_SERVICES)
    echo "未指定服务，将更新所有服务"
else
    SERVICES_TO_UPDATE=("$@")

    # 验证指定的服务是否存在
    for service in "${SERVICES_TO_UPDATE[@]}"; do
        if ! echo "${ALL_SERVICES[@]}" | grep -q -w "$service"; then
            echo "警告: 服务 $service 不存在，将跳过"
            SERVICES_TO_UPDATE=("${SERVICES_TO_UPDATE[@]/$service}")
        fi
    done

    # 检查经过验证后是否还有服务需要更新
    if [ ${#SERVICES_TO_UPDATE[@]} -eq 0 ]; then
        echo "没有有效的服务需要更新"
        exit 1
    fi

    echo "将更新以下服务:"
    echo "-------------------------"
    printf "%s\n" "${SERVICES_TO_UPDATE[@]}"
    echo "-------------------------"
fi

# 逐个处理服务
for service in "${SERVICES_TO_UPDATE[@]}"; do
    SERVICE_DIR="$LOCAL_BASE_DIR/$service"
    echo "开始处理服务: $service"

    # 查找最新的JAR文件（按版本号排序）
    JAR_FILE=$(find "$SERVICE_DIR/build/libs" -maxdepth 1 -type f -name "$service-*.jar" | sort -V | tail -1)

    if [ -z "$JAR_FILE" ]; then
        echo "警告: 在 $SERVICE_DIR/build/libs 中未找到JAR文件，跳过该服务"
        continue
    fi

    echo "找到JAR文件: $JAR_FILE"

    # 上传JAR文件到远程服务器
    echo "正在上传文件到 $REMOTE_SERVER:$REMOTE_BASE_DIR/$service/..."
    scp "$JAR_FILE" "$REMOTE_SERVER:$REMOTE_BASE_DIR/$service/"

    if [ $? -ne 0 ]; then
        echo "警告: 文件上传失败，跳过该服务"
        continue
    fi

    # 远程启动服务
    echo "正在远程启动服务..."
    # ssh "$REMOTE_SERVER" "chown www:www $REMOTE_BASE_DIR/$service/$service-*.jar && su - www -c '$REMOTE_BASE_DIR/$service/$service-start.sh'"
    # ssh "$REMOTE_SERVER" "chown www:www $REMOTE_BASE_DIR/$service/$service-*.jar && sudo systemctl restart $service"
    ssh "$REMOTE_SERVER" "chown www:www $REMOTE_BASE_DIR/$service/$service-*.jar && systemctl restart $service"

    echo "$service 处理完成"
    echo "-------------------------"
done

echo "所有指定服务处理完毕"
