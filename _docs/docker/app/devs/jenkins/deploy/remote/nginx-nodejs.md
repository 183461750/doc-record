---
layout: default
title: nginx-nodejs
parent: deploy
nav_order:       16
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

- 执行 shell
- 将镜像上传到私仓
- PS: Jenkins的部署需要使用remote/jenkins.yml文件部署(主要是需要在容器内使用docker命令)

```shell

export app_version=${BUILD_NUMBER}

cd $WORKSPACE

mkdir -p ./nginx/conf.d/

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

# 登录阿里云私仓 todo <username>和<password>需要手动替换成真实的数据
echo <password> | docker login -u <username> --password-stdin registry.cn-zhangjiakou.aliyuncs.com

# 构建镜像
docker build -t $JOB_NAME:$app_version .

# 上传镜像到私服
docker tag $JOB_NAME:$app_version registry.cn-zhangjiakou.aliyuncs.com/fa/$JOB_NAME:$app_version
docker push registry.cn-zhangjiakou.aliyuncs.com/fa/$JOB_NAME:$app_version

# 退出阿里云私仓
docker logout

```

- 在构建步骤中添加[Send files or execute commands over SSH(通过ssh远程执行shell命令)]步骤

```shell

export app_version=${BUILD_NUMBER}

# 创建工作目录
mkdir -p /www/temp/jenkins/docker
cd /www/temp/jenkins/docker

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
