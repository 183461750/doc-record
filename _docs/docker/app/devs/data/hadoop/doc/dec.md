---
layout: default
title: dec
nav_order: 16
description: docker-compose部署hadoop集群
parent: hadoop
has_children: false
permalink: "/docker/app/devs/data/hadoop/doc/dec/"
---

# docker-compose部署hadoop集群

## 创建网络

```shell
docker network create --driver overlay --attachable --subnet 10.11.0.0/24 sg-hadoop
```

## 创建标签

```shell
docker node update --label-add hadoop-datanode=datanode sangang
```

---

## 部署启动与查看

### docker stack部署启动

```shell
docker stack deploy -c docker-compose.yml hadoop
```

### 查看服务状态，一秒一次，启动之后可通过IP：端口访问界面

```shell
watch -n 1 docker stack services hadoop
```

### 查看服务所在node节点

```shell
docker stack ps hadoop
```

### 停止删除hadoop服务

```shell
docker stack rm hadoop
```
