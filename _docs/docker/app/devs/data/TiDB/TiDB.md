---
---
layout: default
title: doc
nav_order: 15
description: TiDB部署记录
parent: data
has_children: false
permalink: "/docker/app/devs/data/TiDB/TiDB/"
---

# TiDB部署记录

## 启动命令

```shell
docker swarm init # if your docker daemon is not already part of a swarm
mkdir -p data logs
docker stack deploy tidb -c docker-swarm.yml
mysql -h 127.0.0.1 -P 4000 -u root
```

## 参考资料

- [tidb-docker-compose官方部署配置](https://github.com/pingcap/tidb-docker-compose)
  
