---
layout: default
title: doc
nav_order: 14
description: Nginx
parent: nginx
has_children: false
permalink: "/docker/mid/nginx/doc/doc/"
---

# Nginx

## 构建nginx镜像

```shell
docker build -t nginx:1.0 .
```

## nginx默认nginx.conf配置路径

```shell
cat etc/nginx/nginx.conf
cat etc/nginx/conf.d/default.conf
```

## 代理Jenkins

- [参考文章](http://t.csdn.cn/CUODV)

## 配置ssl证书

- nginx查看是否安装http_ssl_module模块

```shell
#打开nginx的sbin文件夹
cd /usr/local/nginx/sbin/nginx
#查看是否安装
nginx -V

# 如果出现 configure arguments: --with-http_ssl_module, 则已安装（下面的步骤可以跳过，进入 nginx.conf 配置）

```
