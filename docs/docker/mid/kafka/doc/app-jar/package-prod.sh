#!/bin/sh
#进入文件根目录
#cd "$WORKSPACE"

#项目打包
mvn clean install package '-Dmaven.test.skip=true'