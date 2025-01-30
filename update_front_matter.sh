#!/bin/bash

process_file() {
    local file="$1"
    local parent_dir=$(dirname "$file")
    local parent_name=$(basename "$(dirname "$parent_dir")")
    local title=$(basename "$file" .md)
    
    # 如果文件是 index.md，跳过处理
    if [[ $(basename "$file") == "index.md" ]]; then
        return
    fi
    
    # 获取目录层级，用于设置 nav_order
    local depth=$(echo "$file" | tr -cd '/' | wc -c)
    
    # 读取文件内容
    content=$(cat "$file")
    
    # 检查文件是否已经有 front matter
    if [[ $content != ---* ]]; then
        # 根据目录结构确定父级
        case "$parent_name" in
            "docker")
                parent="Docker"
                ;;
            "kubernetes")
                parent="Kubernetes"
                ;;
            "os")
                parent="操作系统"
                ;;
            "tools")
                parent="工具集"
                ;;
            *)
                parent=$(echo "$parent_name" | sed 's/\b\(.\)/\u\1/g')
                ;;
        esac
        
        # 创建新的 front matter
        new_content="---
layout: default
title: ${title}
parent: ${parent}
nav_order: ${depth}
---

${content}"
        
        # 写回文件
        echo "$new_content" > "$file"
        echo "已更新: $file"
    fi
}

# 处理所有 markdown 文件
find /Users/fa/dev/projects/other/me/doc-main/doc-record/_docs -name "*.md" | while read -r file; do
    process_file "$file"
done
