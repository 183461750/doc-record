---
layout: default
title: '"doc"'
nav_order: 16
description: tomcat部署war包相关文档
parent: uackend
has_children: false
permalink: "/docker/dev_utls/dev-container/local-dev-deploy/backend/tomcat-war/tomcat-war/"
---

# tomcat部署war包相关文档

## 缺少字体的问题

- [对应的Dockerfile](./has-font/Dockerfile)

```bash
# 只需要在项目的docker部署文件Dockerfile里添加一行代码（在生成镜像需要外网）
RUN apk add --update font-adobe-100dpi ttf-dejavu fontconfig
```
