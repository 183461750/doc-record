---
layout: default
title: Linux查看某个进程占用的内存大小
nav_order: 13
description: Linux查看某个进程占用的内存大小
parent: ai
has_children: false
permalink: "/materiel/ai/linux/linux查看某个进程占用的内存大小/"
---

# Linux查看某个进程占用的内存大小

在 Linux 系统中，有多种方法可以查看某个进程占用的内存大小，以下是一些常见的方法：

**方法一：使用 `ps` 命令**

`ps` 命令可以显示进程的状态信息，包括内存使用情况。

例如：

```bash
ps -aux | grep <进程名>
```

通过这个命令，可以获取到指定进程的相关信息，其中 `RSS` 列显示的就是进程占用的物理内存大小（单位为 KB）。

**方法二：使用 `top` 命令**

`top` 命令是一个动态的系统性能监控工具。

在 `top` 界面中，按 `P` 键可以按照 CPU 使用率对进程排序，按 `M` 键可以按照内存使用率对进程排序。找到您关注的进程，就能看到其内存使用情况。

**方法三：使用 `pmap` 命令**

`pmap` 命令可以报告进程的内存映射关系及占用情况。

例如：

```bash
pmap <进程 ID>
```

它会显示进程的详细内存分布情况。

假设我们要查看一个名为 `nginx` 的进程占用的内存大小，就可以使用上述命令来获取相关信息。比如使用 `ps -aux | grep nginx` ，输出可能类似于：

```bash
root      1234  0.0  0.1 123456  7890?        Ss   14:00   0:00 nginx: master process /usr/sbin/nginx
```

其中 `123456` 就是该进程占用的物理内存大小（单位为 KB）。
