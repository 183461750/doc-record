---
layout: default
title: centos7报错记录
nav_order: 12
description: centos7报错记录
parent: Draft
has_children: false
permalink: "/materiel/draft/centos7报错记录/"
grand_parent: Materiel
---

# centos7报错记录

## 解决 docker Failed to get D-Bus connection 报错

[参考文章](https://www.cnblogs.com/as007012/p/10042387.html)

systemctl start http.service
Failed to get D-Bus connection: No connection to service manager.

   这个的原因是因为dbus-daemon没能启动。其实systemctl并不是不可以使用。将你的CMD或者entrypoint设置为/usr/sbin/init即可。会自动将dbus等服务启动起来。
   然后就可以使用systemctl了。命令如下：
   docker run --privileged  -ti -e "container=docker"  -v /sys/fs/cgroup:/sys/fs/cgroup  centos  /usr/sbin/init

## 解决使用SSH登录Linux实例时secure日志显示“failed to create session access denied”

[参考文章](https://help.aliyun.com/zh/ecs/the-secure-log-entry-failed-to-create-session-access-denied-is-displayed-when-you-log-on-to-a-linux-instance-through-ssh)

- 问题描述

```bash
# 登录docker容器执行命令报能看到以下报错. $ `systemctl status sshd`
# pam_selinux(sshd:session): Error sending audit message.
# failed to create session access denied

# 同时在登录界面还能看到提示以下信息。$ `ssh -p 3333 127.0.0.1`
# root@127.0.0.1's password: 
# Last login: Fri Oct 11 05:50:17 2024 from gateway
# /bin/bash: Permission denied
# Connection to 127.0.0.1 closed.

# 问题原因: 由于开启了SELinux，一般情况下开启SELinux会提高系统的安全性，但是会破坏操作系统的文件，从而造成系统异常。

# 解决方法: setenforce 0|1, 0: 设置为permissive, 1: 设置为enforcing
# 相关命令: getenforce: 获取selinux当前状态, sestatus :查看selinux状态
setenforce 0
```
