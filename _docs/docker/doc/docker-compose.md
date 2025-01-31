---
---
layout: default
title: docker-compose
nav_order: 12
description: docker-compose相关记录
parent: Docker
has_children: false
permalink: "/docker/doc/docker-compose/"
---

# docker-compose相关记录

## 安装或升级指定版本

```shell
# 查看之前下载的程序
ll /usr/local/bin/docker-compose
# 删除之前下载的程序
rm /usr/local/bin/docker-compose

# 下载安装程序到指定目录
# sudo curl -L https://get.daocloud.io/docker/compose/releases/download/1.26.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
sudo curl -L https://github.com/docker/compose/releases/download/v2.11.2/docker-compose-linux-x86_64 > /usr/local/bin/docker-compose

# 添加执行权限
chmod +x /usr/local/bin/docker-compose

```

- 使用包管理器安装

```shell
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

sudo yum install -y docker-compose

```

- 使用python安装docker-compose
  - [参考文章](https://help.aliyun.com/zh/ecs/use-cases/deploy-and-use-docker-on-alibaba-cloud-linux-2-instances)

```shell
# 重要: 仅Python 3及以上版本支持docker-compose，并请确保已安装pip。
pip3 install -U pip setuptools
pip3 install docker-compose
docker-compose --version
```

> 请注意，使用包管理器安装的方式可以确保安装的是官方支持的稳定版本。而使用pip安装的方式可能会安装最新版本，但在某些情况下可能会遇到依赖关系或兼容性问题。

## 示例命令

```bash
docker compose -f ./docker-compose.yml -p project_name up -d --build service_name
```
