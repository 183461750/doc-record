---
layout: "default"
title: "doc"
nav_order: 17
description: "openvpn客户端"
parent: "Docker"
has_children: false
permalink: "/docker/app/networks/vpn/openvpn/docker/client/doc/"
---

# openvpn客户端

[科学上网与VPN办公的完美结合](https://blog.long2ice.io/2023/03/%E7%A7%91%E5%AD%A6%E4%B8%8A%E7%BD%91%E4%B8%8Evpn%E5%8A%9E%E5%85%AC%E7%9A%84%E5%AE%8C%E7%BE%8E%E7%BB%93%E5%90%88/)

```bash
# Then on your host machine test it with curl:
curl ifconfig.co/json -x socks5h://myuser:mypass@127.0.0.1:7777
```
