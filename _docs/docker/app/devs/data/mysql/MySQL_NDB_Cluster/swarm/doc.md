---
layout: "default"
title: "doc"
nav_order: 17
description: "docker swarm版部署文档"
parent: "MySQL_NDB_Cluster"
has_children: false
permalink: "/docker/app/devs/data/mysql/MySQL_NDB_Cluster/swarm/doc/"
---

# docker swarm版部署文档

## 创建网络

```shell
# 初始化swarm
# docker swarm init
# 这里网络可以不创建，需要的话可以通过以下命令创建
# docker network create -d  overlay --attachable middleware
```

## 启动集群

```shell
docker stack deploy -c docker-compose.yml mysqlCluster
```

## 参考资料

- [docker环境安装MySQL-Cluster](http://t.csdnimg.cn/9KmNs)
