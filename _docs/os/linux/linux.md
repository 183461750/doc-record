---
layout: default
title: Linux系统
nav_order: 12
description: linux系统文档
parent: 操作系统
has_children: true
permalink: "/os/linux/linux/"
---

# Linux系统文档

```bash
# 获取系统IP
hostname -I | cut -f1 -d' '
# 关机
# sshpass -p root ssh -o "StrictHostKeyChecking=no" root@$(hostname -I | cut -f1 -d' ') "sudo poweroff"
sshpass -p root ssh -o StrictHostKeyChecking=no root@10.0.16.16 sudo poweroff
```

## yum命令

- 切换yum源

[参考](https://developer.aliyun.com/article/675241)

```bash
# 备份旧源
mv CentOS-Base.repo CentOS-Base.repo.v2.bak
# 添加新源(阿里镜像源)
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo

```
