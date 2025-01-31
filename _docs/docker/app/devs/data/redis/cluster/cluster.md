---
---
layout: default
title: doc
nav_order: 16
description: 部署记录
parent: redis
has_children: false
permalink: "/docker/app/devs/data/redis/cluster/cluster/"
---

# 部署记录

## todo

- 测试这个配置的IP调整为服务名，看看是否可行
  - 相关配置文件[redis.yml](./simple/v2/redis.yml)

```shell
echo 'cluster-announce-ip 10.0.16.27' >> redis.conf  &&
# echo 'cluster-announce-ip redis1' >> redis.conf  &&
```
