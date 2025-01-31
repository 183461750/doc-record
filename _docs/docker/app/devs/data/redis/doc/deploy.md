---
layout: "default"
title: "deploy"
nav_order: 16
description: "主redis服务配置```/path/to/redis/config/master.conf 自定义配置```"
parent: "redis"
has_children: false
permalink: "/docker/app/devs/data/redis/doc/deploy/"
---

### 主redis服务配置
```
/path/to/redis/config/master.conf
## 自定义配置
```

### 从redis服务配置
```
/path/to/redis/config/slave.conf
## 自定义配置
slaveof master 6379
```
