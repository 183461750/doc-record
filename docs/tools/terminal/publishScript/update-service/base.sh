#!/bin/bash

# 环境变量配置（保持固定值，也可改为${VAR:-默认值}形式保留环境变量优先级）
export LOCAL_BASE_DIR="/Users/fa/dev/projects/IdeaProjects/company/iuin/lingxi/private-deploy/xxx-sbbc"
export REMOTE_SERVER="xxx.dev.iuin"
export REMOTE_BASE_DIR="/data/xxx"

# 定义更新脚本路径
UPDATE_SCRIPT="update-service.sh"

# 检查更新脚本是否存在
if [ ! -f "$UPDATE_SCRIPT" ]; then
    echo "错误: 更新脚本 $UPDATE_SCRIPT 不存在，请检查文件名拼写"
    exit 1
fi

# 添加执行权限
chmod +x "$UPDATE_SCRIPT"

# 执行更新脚本，传递本地目录和所有命令行参数（服务名）
# "$@" 代表传递所有命令行参数
# 示例:  ./"$UPDATE_SCRIPT" "pay-service" "$@"
./"$UPDATE_SCRIPT" "$@"
