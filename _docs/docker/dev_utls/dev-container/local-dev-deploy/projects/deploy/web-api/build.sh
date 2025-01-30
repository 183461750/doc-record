#!/bin/bash

current_dir_basename=$(basename $(dirname "$curr_file"))

find_file_dir=$workdir/$current_dir_basename

cd $find_file_dir

find_file() {
    for file in $find_file_dir/*; do
        if [[ -f "$file" && "$(basename $file)" == "package.json" ]]; then
            echo "开始构建：file: $file"
            # 安装依赖(非必须)
            # npm --registry https://registry.npmmirror.com/ install
            npm run build:test
            break;
        elif [[ -f "$file" && "$(basename $file)" == "pom.xml" ]]; then
            echo "开始构建：file: $file"
            # java构建
            mvn clean package -Dmaven.test.skip=true -f "$find_file_dir/pom.xml" -P intranet
            break;
        fi
    done
}

find_file
