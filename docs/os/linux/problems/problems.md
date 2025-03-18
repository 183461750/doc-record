---
layout: default
title: Linux问题记录
nav_order: 13
description: 问题记录
parent: Problems
has_children: false
permalink: "/os/linux/problems/problems/"
grand_parent: Linux
---

# 问题记录

## yum

报错内容:

```text
This system is not registered with an entitlement server. You can use subscription-manager to register.
```

```bash
vim /etc/yum/pluginconf.d/subscription-manager.conf
# enabled=0
```

报错内容:

```text
http://mirrors.aliyun.com/centos/7/os/x86_64/repodata/repomd.xml: [Errno 12] Timeout on http://mirrors.aliyun.com/centos/7/os/x86_64/repodata/repomd.xml: (28, 'Operation too slow. Less than 1000 bytes/sec transferred the last 30 seconds')
```

[参考文章](https://juejin.cn/post/7161690775980507166)
    阿里yum源出问题了

[参考文章](https://cloud.tencent.com/document/product/213/52559#dab668ec-1b0e-4112-a147-5071fdb19a9e)
    切换为使用腾讯yum源

```bash
# 切换使用腾讯的yum源
curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.tencent.com/repo/centos7_base.repo
```

## vm.max_map_count作用

vm.max_map_count 是 Linux 内核的一个参数，用于控制一个进程可以拥有的最大内存映射区域（memory map areas）的数量。这个参数对于某些应用程序（特别是 Java 应用程序）非常重要，因为这些应用程序在运行时需要创建大量的内存映射区域。

默认情况下，vm.max_map_count 的值可能较低（例如 65530），这对于某些应用程序来说可能不够。当应用程序尝试创建更多的内存映射区域时，可能会遇到 OutOfMemoryError 或类似的错误。

将 vm.max_map_count 设置为至少 262144 可以解决这个问题，因为这个值通常足够大，可以满足大多数应用程序的需求。

要查看当前的 vm.max_map_count 值，可以在终端中运行以下命令：

```bash
sysctl vm.max_map_count
```

要更改 vm.max_map_count 的值，可以在终端中运行以下命令（以 root 用户身份）：

```bash
sysctl -w vm.max_map_count=262144
```

要使更改永久生效，可以将以下行添加到 /etc/sysctl.conf 文件中：

```bash
vm.max_map_count=262144
```

然后运行 `sysctl -p` 命令以应用更改。

请注意，增加 vm.max_map_count 的值可能会增加系统的资源消耗，因此在更改此参数之前，请确保了解其潜在影响。
