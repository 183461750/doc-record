---
layout: default
title: docker-context
nav_order: 13
description: docker上下文相关记录
parent: Docker-context
has_children: false
permalink: "/docker/doc/docker-context/docker-context/"
grand_parent: Doc
---

# docker上下文相关记录

[参考文章](https://dockerdocs.cn/engine/context/working-with-contexts/)

## 创建上下文

```bash
docker context create unix-test \
  --docker host=unix:///var/run/docker.sock
# 使用k8s作为协调器(被遗弃了)
docker context create k8s-test \
  --default-stack-orchestrator=kubernetes \
  --kubernetes config-file=/home/ubuntu/.kube/config \
  --docker host=unix:///var/run/docker.sock
```
