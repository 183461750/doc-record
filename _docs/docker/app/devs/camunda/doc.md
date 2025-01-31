---
layout: "default"
title: "doc"
nav_order: 14
description: "camunda使用记录"
parent: "devs"
has_children: true
permalink: "/docker/app/devs/camunda/doc/"
---

# camunda使用记录

## 使用docker运行camunda

```bash
# 拉取代码
git clone https://github.com/camunda/camunda-platform
# 进入指定目录
cd docker-compose/camunda-8.6
# 启动容器
docker compose --profile modeling up -d
# 打开web页面[localhost:8070](localhost:8070)
```
