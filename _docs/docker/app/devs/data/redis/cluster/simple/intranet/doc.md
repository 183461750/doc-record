---
layout: default
title: doc
parent: simple
nav_order:       18
---

# 部署内网redis

## 相关执行命令

```bash

# 启动集群节点
docker stack up -c redis.yml rds-cluster

# 打印创建集群的命令
echo docker exec -it $(docker ps -qf "name=rds-cluster_redis1.1") redis-cli --cluster create $(docker inspect -f '{{.NetworkSettings.Networks.middleware.IPAddress}}:{{range $p, $conf := .NetworkSettings.Ports}}{{if eq (index (split $p "/") 0 | printf "%.3s") "800"}}{{(index (split $p "/") 0)}}{{end}}{{end}}' $(docker ps -qf "name=rds-cluster_redis")) --cluster-replicas 0 -a foobared

```
