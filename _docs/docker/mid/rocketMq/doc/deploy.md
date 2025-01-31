---
---
layout: default
title: deploy
nav_order: 14
description: broker.conf``` 设置宿主机ipbrokerIP1=manager``` 查看节点名称```shell scriptdocker
  node ls``` 节点打标```shell scriptdocker node update --label-add role=标签名称  宿主机A节点名称```
parent: rocketMq
has_children: false
permalink: "/docker/mid/rocketMq/doc/deploy/"
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
