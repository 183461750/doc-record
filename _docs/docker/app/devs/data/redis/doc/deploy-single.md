---
layout: default
title: deploy-single
parent: redis
nav_order:       16
---

### 单机部署
```shell script
docker run -p 6379:6379 --name redis -v /data/docker/redis/config/redis.conf:/etc/redis/redis.conf -v /data/docker/redis/data:/data -d redis redis-server /etc/redis/redis.conf --appendonly yes --requirepass "foobared"
```
