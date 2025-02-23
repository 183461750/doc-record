---
layout: default
title: README
nav_order: 16
description: deploy
parent: Deploy
has_children: false
permalink: "/docker/dev_utls/dev-container/local-dev-deploy/projects/deploy/readme/"
grand_parent: Projects
---

# deploy

## deploy_to_docker.sh使用方式

```bash
# 需要打包并部署指定服务
sh deploy_to_docker.sh package web
# 无需打包仅部署指定服务
sh deploy_to_docker.sh web
# 部署所有服务
sh deploy_to_docker.sh
```

## 拉取位置

- 放到和项目同级目录，所有需要部署的项目都放到同级目录

## docker compose 命令

```bash
# 部署某个服务
docker compose -f ./docker-compose.yml -p ma-compose up -d --build $service_name
# 重启某个服务
docker compose -p ma-compose restart nginx
```
