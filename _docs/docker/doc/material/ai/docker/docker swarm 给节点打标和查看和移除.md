---
layout: "default"
title: "Docker Swarm 节点标签管理"
nav_order: 5
description: "Docker Swarm 节点标签管理"
parent: "Docker"
has_children: false
permalink: "/docker/doc/material/ai/docker/docker swarm 给节点打标和查看和移除/"
---

# Docker Swarm 节点标签管理

## 查看节点标签

使用以下命令查看节点标签：

```bash
# 查看所有节点的标签
docker node ls --format "ID: {{.ID}}, Labels: {{.Labels}}"

# 查看特定节点的标签
docker node inspect NODE_ID --format "Labels: {{.Spec.Labels}}"
```

## 添加节点标签

使用以下命令添加标签：

```bash
docker node update --label-add key=value NODE_ID
```

例如：
```bash
docker node update --label-add environment=production node1
```

## 移除节点标签

使用以下命令移除标签：

```bash
docker node update --label-rm key NODE_ID
```

例如：
```bash
docker node update --label-rm environment node1
```

## 使用标签进行服务部署

在 docker-compose.yml 中使用标签约束：

```yaml
version: '3.8'
services:
  app:
    deploy:
      placement:
        constraints:
          - node.labels.environment == production
