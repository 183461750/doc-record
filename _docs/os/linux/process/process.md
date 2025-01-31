---
layout: default
title: '"doc"'
nav_order: 13
description: 进程
parent: linux
has_children: false
permalink: "/os/linux/process/process/"
---

# 进程

## 没有足够的资源创建本地线程

### java.lang.OutOfMemoryError: unable to create new native thread

- 确认资源是否够

```bash
# 查看资源不够的应用是由哪个用户启动的(这里示例为www用户启动)
su www

# 查看用户最大进程数(PS: 不同用户查看到的最大用户进程数不一样)
ulimit -a
# max user processes              (-u) 4096

# 当前用户占用的总线程数
top -H 

```

- 修改用户最大进程数

[参考文章](https://www.cnblogs.com/operationhome/p/11966041.html)

```bash
# 查看资源不够的应用是由哪个用户启动的(这里示例为www用户启动)
su www

# centos7版本的配置
vim /etc/security/limits.d/20-nproc.conf
# 写入以下内容
# www        soft    nproc     40960

# 检查是否生效
ulimit -a
# max user processes              (-u) 40960

```
