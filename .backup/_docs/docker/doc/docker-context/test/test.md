---
layout: default
title: doc
nav_order: 14
description: 测试
parent: Test
has_children: false
permalink: "/docker/doc/docker-context/test/test/"
grand_parent: Docker-context
---

# 测试

```bash
docker context create k8s-test \
  --default-stack-orchestrator=kubernetes \
  --kubernetes config-file=~/.kube/config \
  --docker host=ssh://root@23.internet.company
```
