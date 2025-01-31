---
layout: default
title: doc
nav_order: 16
description: redis 官方客户端
parent: redis
has_children: false
permalink: "/docker/app/devs/data/redis/client/client/"
---

# redis 官方客户端

```shell
# 使用docker部署客户端页面
docker run -v redisinsight:/db -p 8001:8001 redislabs/redisinsight:latest
# ps: 也许可能起不起来，但没关系，可以尝试手动起下，也许就可以了[docker start ${containerId}]
```
