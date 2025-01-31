---
layout: default
title: doc
nav_order: 14
description: sub-web
parent: networks
has_children: false
permalink: "/docker/app/networks/sub-web/sub-web/"
---

# sub-web

订阅转换

[前端仓库地址](https://github.com/CareyWang/sub-web?tab=readme-ov-file#install)
[后端仓库地址](https://github.com/tindy2013/subconverter)

```bash
# 前端部署
docker run -d -p 58080:80 --restart always --name subweb careywong/subweb:latest
# 后端部署
docker run -d --restart=always -p 25500:25500 tindy2013/subconverter:latest
```
