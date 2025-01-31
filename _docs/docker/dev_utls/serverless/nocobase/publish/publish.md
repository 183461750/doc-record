---
layout: default
title: '"doc"'
nav_order: 15
description: 使用记录
parent: nocouase
has_children: false
permalink: "/docker/dev_utls/serverless/nocobase/publish/publish/"
---

# 使用记录

## 发布到Serverless Registry

```shell
# 登录
s cli registry login
# 发布
s cli registry publish
```

## 从Serverless Registry中拉取项目

```shell
# 初始化项目
s init start-nocobase -d start-nocobase
# 进入项目，并进行项目部署
cd start-nocobase && s deploy -y
```
