#!/bin/bash
set -x  # 输出所有执行的命令，便于调试
set -euo pipefail  # 严格错误检查

# 环境变量配置
export REMOTE_SERVER="haimingwei.dev.ssy"
export REMOTE_BASE_DIR="/data/haimingwei"
LOCAL_BASE_DIR=""  # 初始化本地目录变量
declare -a SERVICES=()  # 存储服务名数组

# 解析命令行参数
# 支持 -d/--dir 指定本地目录，-s/--service 指定服务名（可多个）
while [[ $# -gt 0 ]]; do
    case "$1" in
        -d|--dir)
            # 处理目录参数
            if [[ -n "$2" && ! "$2" =~ ^- ]]; then
                if [[ -d "$2" ]]; then
                    # 转换为绝对路径
                    LOCAL_BASE_DIR=$(cd "$2" && pwd)
                    shift 2
                else
                    echo "错误: -d 指定的目录 $2 不存在" >&2
                    exit 1
                fi
            else
                echo "错误: -d 选项需要指定有效的目录参数" >&2
                echo "使用方法: $0 [-d 目录路径] -s 服务名1 [服务名2...]" >&2
                exit 1
            fi
            ;;
        -s|--service)
            # 处理服务名参数（可跟多个服务）
            shift  # 跳过-s选项
            while [[ $# -gt 0 && ! "$1" =~ ^- ]]; do
                SERVICES+=("$1")  # 添加服务名到数组
                shift
            done
            ;;
        -h|--help)
            # 显示帮助信息
            echo "使用方法: $0 [-d 目录路径] -s 服务名1 [服务名2...]"
            echo "选项:"
            echo "  -d, --dir      指定本地服务目录（默认：当前目录的上级目录）"
            echo "  -s, --service  指定要更新的服务名（必填，可多个）"
            echo "  -h, --help     显示帮助信息"
            exit 0
            ;;
        -*)
            # 处理未知选项
            echo "错误: 未知选项 $1" >&2
            echo "使用方法: $0 [-d 目录路径] -s 服务名1 [服务名2...]" >&2
            exit 1
            ;;
        *)
            # 非选项参数（未使用-s指定的服务名）
            echo "错误: 服务名必须通过 -s 选项指定" >&2
            echo "使用方法: $0 [-d 目录路径] -s 服务名1 [服务名2...]" >&2
            exit 1
            ;;
    esac
done

# 设置本地目录默认值（当前目录的上级目录）
if [[ -z "$LOCAL_BASE_DIR" ]]; then
    LOCAL_BASE_DIR=$(cd "$(pwd)/.." && pwd)
    echo "未指定本地目录，使用默认值: $LOCAL_BASE_DIR"
fi

# 验证本地目录存在
if [[ ! -d "$LOCAL_BASE_DIR" ]]; then
    echo "错误: 本地目录 $LOCAL_BASE_DIR 不存在" >&2
    exit 1
fi

export LOCAL_BASE_DIR="$LOCAL_BASE_DIR"

# 检查是否指定了至少一个服务名
if [[ ${#SERVICES[@]} -eq 0 ]]; then
    echo "错误: 必须通过 -s 选项指定至少一个服务名" >&2
    echo "使用方法: $0 [-d 目录路径] -s 服务名1 [服务名2...]" >&2
    exit 1
fi

echo "===== 执行配置 ====="
echo "本地目录: $LOCAL_BASE_DIR"
echo "远程服务器: $REMOTE_SERVER"
echo "远程目录: $REMOTE_BASE_DIR"
echo "待处理服务: ${SERVICES[*]}"
echo "===================="

# 定义更新脚本路径
UPDATE_SCRIPT="update-service.sh"

# 检查更新脚本是否存在
if [[ ! -f "$UPDATE_SCRIPT" ]]; then
    echo "错误: 更新脚本 $UPDATE_SCRIPT 不存在，请检查文件名拼写" >&2
    exit 1
fi

# 添加执行权限
chmod +x "$UPDATE_SCRIPT"

# 执行更新脚本：传递本地目录和服务列表
echo "开始执行更新脚本: $UPDATE_SCRIPT"
#"./$UPDATE_SCRIPT" "$LOCAL_BASE_DIR" "${SERVICES[@]}"
"./$UPDATE_SCRIPT" "${SERVICES[@]}"
