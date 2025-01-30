---
layout: default
title: deploy
parent: rocketMq
nav_order:       14
---

## broker.conf
```
# 设置宿主机ip
brokerIP1=manager
```
## 查看节点名称
```shell script
docker node ls
```
## 节点打标
```shell script
docker node update --label-add role=标签名称  宿主机A节点名称
```
