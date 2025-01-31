---
layout: default
title: 如何让docker走代理
nav_order: 12
description: 如何让docker走代理
parent: materiel
has_children: false
permalink: "/materiel/draft/如何让docker走代理/"
---

# 如何让docker走代理

[参考本地文章](https://github.com/183461750/doc-record/blob/84e35bffe7f0f1fa2a6cf2dbe65cc0292a8c4540/materiel/ai/docker/%E5%A6%82%E4%BD%95%E8%AE%A9docker%E8%B5%B0%E4%BB%A3%E7%90%86.md)
[参考文章](https://neucrack.com/p/286)

```bash
# sudo vim /etc/systemd/system/docker.service.d/http-proxy.conf
[Service]
Environment="HTTP_PROXY=http://127.0.0.1:8123"
Environment="HTTPS_PROXY=http://127.0.0.1:8123"
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker

```
