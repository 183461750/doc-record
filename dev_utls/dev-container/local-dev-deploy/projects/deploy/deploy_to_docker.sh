#!/bin/bash

source ./.env

workdir=$(readlink -f "$workdir")

# 获取当前文件的文件名
current_basename=$(basename "$0")

# 指定当前目录
deploy_dir=$current_dir

package=$1
service_name=$1

if [[ $package == "package" ]]; then
    service_name=$2
fi

execute_sh_files() {
    top_directory=$(readlink -f "$1")
    package="$2"
    service_name="$2"

    if [[ $package != "package" ]]; then
        return;
    fi

    service_name="$3"

    for file in "$top_directory"/*; do
        if [[ -d "$file" ]]; then
            if [[ -n "$service_name" && $(basename "$file") != "$service_name" ]]; then
                continue;
            fi
            execute_sh_files "$file" "$package" "$service_name"  # 递归调用，进入子目录
        elif [[ -f "$file" && "$file" == *.sh && $(basename "$file") != $current_basename ]]; then
            echo "Executing $file basename: $(basename "$file") current_basename: $current_basename"
            chmod +x "$file"  # 添加执行权限
            curr_file=$file
            source "$file"  # 执行.sh文件
        fi
    done
}

execute_sh_files "$deploy_dir" "$package" "$service_name"

cd $deploy_dir

# 部署
docker compose -f $deploy_dir/docker-compose.yml -p ma-compose up -d --build $service_name
