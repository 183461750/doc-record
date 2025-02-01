---
layout: default
title: nginx-nodejs
nav_order: 16
description: 使用Jenkins构建node项目
parent: Simple
has_children: false
permalink: "/docker/app/devs/jenkins/deploy/simple/nginx-nodejs/"
grand_parent: Deploy
---

# 使用Jenkins构建node项目

## 环境变量

- 系统管理 -> 系统配置 -> 全局属性 -> 环境变量 -> 新增键值对
- DOCKER_JENKINS_WORKSPACE : /var/lib/docker/volumes/soft_jenkins_home/_data/workspace

## NodeJS配置

```shell
# 下载NodeJS插件
# 调整[系统管理 -> 全局工具配置 -> nodeJS 配置]
# nodejs 14.15.0
```

## Jenkins配置

- 创建一个自由风格的项目
- 使用gitee作为代码源
- 在 [构建环境] 步骤 添加 [Provide Node & npm bin/ folder to PATH]
- 在[构建]步骤中添加[执行 shell]步骤

```shell

pwd

# 删除 dist 的所有内容
rm -rf dist

# 安装依赖(非必须)
npm install --registry https://registry.npm.taobao.org
# 构建项目
npm run build:prod

# 删除除 node_modules和dist 以外的所有内容
ls | grep -v 'node_modules\|dist' | xargs  rm -rf

```

- 在构建步骤中添加[Send files or execute commands over SSH(通过ssh远程执行shell)]步骤

```shell

export app_version='1.0'

if [ -z $DOCKER_JENKINS_WORKSPACE ]; then
  echo "环境变量 DOCKER_JENKINS_WORKSPACE:[$DOCKER_JENKINS_WORKSPACE] 缺失，需配置 DOCKER_JENKINS_WORKSPACE 环境变量(exit -1)"
  exit -1
fi

cd $DOCKER_JENKINS_WORKSPACE/$JOB_NAME

mkdir -p ./nginx/conf.d/
# todo 按需调整用户名和组
chown -R 1000:1000 ./nginx

# 添加default.conf文件
tee ./nginx/conf.d/default.conf <<-'EOF'
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;

    #access_log  /var/log/nginx/host.access.log  main;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html; # 用于解决刷新页面后，显示404的问题
    }

}
EOF

# 编辑Dockerfile文件
echo "FROM nginx:stable-alpine" > Dockerfile
echo "MAINTAINER Fa" >> Dockerfile
echo "WORKDIR /usr/share/nginx/html" >> Dockerfile
echo "RUN rm -rf *" >> Dockerfile
echo "ADD ./dist ." >> Dockerfile
echo "ADD ./nginx/conf.d/default.conf /etc/nginx/conf.d/" >> Dockerfile
echo "EXPOSE 80" >> Dockerfile

# 构建镜像
docker build --no-cache -t $JOB_NAME:$app_version .

# 上传镜像到私服
docker tag $JOB_NAME:$app_version registry.cn-zhangjiakou.aliyuncs.com/fa/$JOB_NAME:$app_version
docker push registry.cn-zhangjiakou.aliyuncs.com/fa/$JOB_NAME:$app_version

# 删除空镜像
docker images | awk '{if($1=="<none>")print $3}' | xargs docker rmi &> /dev/null

# 编辑stack yml文件
tee $JOB_NAME.yml <<-'EOF'
version: '3.5'
services:
  $JOB_NAME:
    image: registry.cn-zhangjiakou.aliyuncs.com/fa/$JOB_NAME:${app_version}
    environment:
      TZ: "Asia/Shanghai"
    networks:
      - middleware
    deploy:
      replicas: 1
      update_config:
        parallelism: 1
      restart_policy:
        condition: on-failure
networks:
  middleware:
    external: true
EOF

docker stack up -c $JOB_NAME.yml app --with-registry-auth

```

- Nginx添加代理配置

- 在conf.d目录中添加mall-admin-web-demo.conf文件

```shell
server {
    listen      80;
    server_name mall-admin-web-demo.iuin.xyz iuin.xyz;

    access_log /var/log/mall-admin-web-demo_access.log;
    error_log /var/log/mall-admin-web-demo_error.log;

    location / {
        include cors.conf;
        proxy_set_header Host $host;
        proxy_set_header X-real-ip $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://mall-admin-web-demo;
    }

}

```

## 部署

```shell
# 镜像下载问题，可试这添加--with-registry-auth看看
docker stack up -c $JOB_NAME.yml --with-registry-auth app

```
