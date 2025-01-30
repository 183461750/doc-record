---
layout: default
title: linux-network
parent: Docker
nav_order:       12
---

# linux网络笔记

## linux网卡的开启

```shell
# 网络配置文件位置
cd /etc/sysconfig/network-scripts/　
# 编辑配置文件
vi ifcfg-eth0 
# ONBOOT="no"　　#默认是启动时不开启网卡，我们可以将这个设置为yes
# 然后重启网络
service network restart
```

## firewalld docker 端口映射问题，firewall开放端口后，还是不能访问，解决方案

` [参考文章](http://t.csdn.cn/Xo6XZ)

```shell
# 宿主机ip: 192.168.31.19
 
docker run -itd --name tomcat -p 8080:8080 tomcat /usr/local/apache-tomcat-9.0.30/bin/startup.sh
# 防火墙放开8080端口
firewall-cmd --add-port=8080/tcp --permanent
 
# 问题：发现访问：192.168.31.19:8080 访问不通，关闭firewall后，又可以访问通了
 
# 解决方案，把docker0网卡添加到trusted域
firewall-cmd --permanent --zone=trusted --change-interface=docker0
# 重启加载配置
firewall-cmd --reload
 
# firewall-cmd相关命令：https://www.cnblogs.com/Raodi/p/11625487.html
```

> 以上无效那就使用重启大法吧，貌似有时折腾了老半天，结果，最后重启就好了~
