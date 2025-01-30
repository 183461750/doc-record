---
layout: default
title: ssl
parent: Docker
nav_order:       12
---

# 开启ssl

## telnet ip 443 不通的问题

- 大概率是端口没开导致，需要检查下docker-compose文件的端口映射问题
- 同时可以使用`netstat -npl | grep 443`命令查看端口开通情况
- 或者使用`telnet ip 443`查看端口开通情况
