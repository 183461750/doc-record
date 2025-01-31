---
layout: "default"
title: "firewalld"
nav_order: 12
description: "firewalld防火墙相关配置"
parent: "Docker"
has_children: false
permalink: "/docker/doc/firewalld/"
---

# firewalld防火墙相关配置

- [阿里云开发者社区用户文章参考](https://developer.aliyun.com/article/292603)

```shell
# 安装
yum install firewalld
# 在开机时启用一个服务
systemctl enable firewalld.service
# 在开机时禁用一个服务
systemctl disable firewalld.service
# 查看服务是否开机启动
systemctl is-enabled firewalld.service

# 使最新的防火墙设置规则生效
firewall-cmd --reload 
# 更新防火墙规则并重启服务(用不了)
firewall-cmd --completely-reload 

# 端口添加（--permanent永久生效，没有此参数重启后失效）
firewall-cmd --permanent --zone=public --add-port=80/tcp
# 查看80端口
firewall-cmd --zone=public --query-port=80/tcp
# 删除80端口
firewall-cmd --permanent --zone=public --remove-port=80/tcp

# 查看所有打开的端口
firewall-cmd --zone=public --list-ports

# 添加HTTP协议服务
firewall-cmd --permanent --zone=public --add-service=http
# 删除HTTP协议服务
firewall-cmd --permanent --zone=public --remove-service=http

# 查看当前的服务
firewall-cmd --zone=public --list-services
# 查看还有哪些服务可以打开
firewall-cmd --get-services

# 查看所有信息(所有services和ports都能看到)
firewall-cmd --list-all

# 查询ssh协议服务是否被允许
firewall-cmd --zone=public --query-service=ssh
# 查看已启动的服务列表
systemctl list-unit-files | grep enabled
# 查看启动失败的服务列表
systemctl --failed

# 查看区域信息
firewall-cmd --get-active-zones
# 查看指定接口所属区域
firewall-cmd --get-zone-of-interface=eth0
# 查看当前的区域
firewall-cmd --get-default-zone

# 拒绝所有包
firewall-cmd --panic-on
# 取消拒绝状态
firewall-cmd --panic-off
# 查看是否拒绝
firewall-cmd --query-panic
 
# 安装图形化用户接口工具 firewall-config，则以 root 用户身份运行下列命令
yum install firewall-config

```
