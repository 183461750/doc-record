---
layout: default
title: zk
parent: kafka
nav_order:       14
---

## zk集群 配置文件中配置含义
```shell
vim zoo.cfg
加上以下三行配置
server.1=10.88.0.19:2888:3888;2181
server.2=10.88.0.20:2888:3888;2181
server.3=10.88.0.21:2888:3888;2181
这里10.88.0.X表示的是三台zookeeper容器对应的ip地址；2888是zookeeper容器间通信的端口，3888是zookeeper选举投票的端口，一般来说都是固定的

```
