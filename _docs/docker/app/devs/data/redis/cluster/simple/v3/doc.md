---
layout: default
title: doc
parent: simple
nav_order:       18
---

# 说明文档

- 简化版流程

```shell

# 启动节点
docker stack deploy -c redis.yml redis-cluster

# 搭建集群(自动拼接端口的方式)
docker exec -it $(docker ps -qf "name=redis-cluster_redis1.1") redis-cli --cluster create $(for index in {1..6}; do echo "10.0.16.17:700${index}"; done) --cluster-replicas 1 -a foobared

# 查看集群是否健康
docker exec -it $(docker ps -qf "name=redis-cluster_redis1.1") redis-cli -p 7001 -a foobared cluster info

### 测试执行命令
docker exec -it $(docker ps -qf "name=redis-cluster_redis1.1") redis-cli -c -p 7001 -a foobared info Replication

```
