---
layout: default
title: doc
nav_order: 13
description: yum安装erlang
parent: Erlang
has_children: false
permalink: "/docker/doc/erlang/erlang/"
grand_parent: Doc
---

# yum安装erlang

```shell

#卸载erlang
yum -y remove erlang-*

#按官网的提示操作

#使用存储库安装
wget https://packages.erlang-solutions.com/erlang-solutions-2.0-1.noarch.rpm
rpm -Uvh erlang-solutions-2.0-1.noarch.rpm

#手动添加存储库条目
rpm --import https://packages.erlang-solutions.com/rpm/erlang_solutions.asc

# 清楚原有yum缓存
yum clean all
# 生成缓存
yum makecache
# 查看配置好的yum源是否正常
yum repolist

#查看erlang可安装版本
yum list | grep erlang

yum list erlang --showduplicates | sort -r

#安装erlang,也可安装指定版本
yum install -y erlang

#安装erlang指定版本
yum install erlang-24.0-1.el7.aarch64

```
