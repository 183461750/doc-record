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
