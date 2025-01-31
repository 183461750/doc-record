---
layout: default
title: doc
nav_order: 16
description: 配置docker镜像私服hosts```shellwhereis hostsvi /etc/hosts
parent: docker_registry
has_children: false
permalink: "/docker/app/devs/data/docker_registry/doc/doc/"
---

## 配置docker镜像私服hosts
```shell
whereis hosts
vi /etc/hosts

10.0.0.73 registry.docker.com
```
## 配置不安全域名访问
```shell
vi /etc/docker/daemon.json

{
  "registry-mirrors": [
    "https://registry.docker-cn.com"
  ],
  "insecure-registries": [
    "registry.docker.com:5000"   （ip 为server端的ip）
  ]
}
# 重启服务
systemctl daemon-reload
systemctl restart docker
```
## 上传镜像到私服
```shell
## 拉取一个镜像
docker pull nginx
 
## 查看全部镜像
docker images
 
## 标记本地镜像并指向目标仓库（ip:port/image_name:tag，该格式为标记版本号）
docker tag nginx registry.docker.com:5000/nginx
 
## 提交镜像到仓库
docker push registry.docker.com:5000/nginx

## 查看全部镜像
curl -XGET http://registry.docker.com:5000/v2/_catalog

## 查看指定镜像 
curl -XGET http://registry.docker.com:5000/v2/nginx/tags/list
```
