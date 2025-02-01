---
layout: default
title: 'OutOfMemoryError : unable to create new native Thread'
nav_order: 792
description: 'java.lang.OutOfMemoryError : unable to create new native Thread'
has_children: false
permalink: "/materiel/article/outofmemoryerror : unable to create new native thread/"
parent: Article
grand_parent: Materiel
---

# java.lang.OutOfMemoryError : unable to create new native Thread

```bash
# 使用此命令查看正在运行的线程数
ps -elfT | wc -l
ps -elfT | grep appName|wc -l 
# 要获取进程正在运行的线程数（可以使用 top 或 ps aux 获取进程 pid）：
ps -p <PROCESS_PID> -lfT | wc -l
# 查找哪些进程正在创建线程
ps huH
# 用户可以拥有的线程数量是有限制的。可以通过“最大用户进程数”行进行检查
ulimit -a
# /proc/sys/kernel/threads-max 文件提供系统范围内的线程数限制。 root 用户可以更改该值
# 要更改限制（在本例中为 4096 个线程）：
ulimit -u 4096
# 使用 jps 列出所有 java 进程（只需在 shell 中执行 jps ）并使用每个 Ghost 进程的 kill -9 pid bash 命令分别杀死它们时，它就解决了。
jps
```
