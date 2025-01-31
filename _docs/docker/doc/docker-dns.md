---
---
layout: default
title: docker-dns
nav_order: 12
description: docker内置DNS记录
parent: Docker
has_children: false
permalink: "/docker/doc/docker-dns/"
---

# docker内置DNS记录

- 相关文章
  - [Docker DNS](https://www.hwchiu.com/docs/2023/kind-network)

```bash
# 使用ps查询容器的 PID
ps -ef | grep redis
# 其中 ss 顯示了環境中 127.0.0.11 有監聽兩個 Port，分別對應 TCP 與 UDP 的 DNS 請求，而 iptables 則顯示的相關 DNAT 的規則
sudo nsenter -n -t ${pid} ss -tunlp
sudo nsenter -n -t ${pid} iptables-save -t nat
# 进入容器查看容器内的DNS记录`docker run -it --rm --network middleware busybox`
nslookup redis
```
