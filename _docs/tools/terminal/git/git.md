---
---
layout: default
title: Git
nav_order: 13
description: git使用记录
parent: Terminal
has_children: false
permalink: "/tools/terminal/git/git/"
grand_parent: 工具集
---

# git使用记录

## git-lfs使用

[install](https://packagecloud.io/github/git-lfs/install)
[如何使用 Git LFS](https://help.aliyun.com/document_detail/206889.html)

```shell
# quick install
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
sudo apt-get install git-lfs
# 让仓库支持LFS
git lfs install
# 为了将以示例.bigfile后缀结尾的文件使用Git LFS进行存储，需要执行track命令建立追踪：
git lfs track "*.bigfile"
# 将普通提交中的大文件迁移到lfs中去(非必须)
git lfs migrate import --include="*.bigfile"
# 你可以取消继续跟踪某类文件，并将其从cache中清理：
git lfs untrack "*.bigfile"
git rm --cached "*.bigfile"

```
