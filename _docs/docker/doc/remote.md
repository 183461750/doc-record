---
layout: "default"
title: "remote"
nav_order: 12
description: "远程连接相关记录"
parent: "Docker"
has_children: true
permalink: "/docker/doc/remote/"
---

# 远程连接相关记录

## 不用密码直接登陆 -- ssh密钥登陆

打开你的git-bash，输入`ssh-keygen` ，然后输入时，三个空回车即可。

接着执行`ssh-copy-id <用户名>@<主机IP>`

最后使用ssh尝试连接，哇，一气呵成，直接连上了！
> 需要远程多台时，`ssh-keygen`这个命令也只需一次即可，`ssh-copy-id <用户名>@<主机IP>`这个使用多次即可
