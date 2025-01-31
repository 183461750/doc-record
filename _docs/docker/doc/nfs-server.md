---
layout: "default"
title: "nfs-server"
nav_order: 12
description: "服务端安装NFS服务步骤：- 第一步：安装NFS和rpc。```shell[root@localhost ~] yum install -y  nfs-utils   安装nfs服务[root@localhost ~] yum install -y rpcbind安装rpc服务"
parent: "Docker"
has_children: false
permalink: "/docker/doc/nfs-server/"
---

## 服务端安装NFS服务步骤：
- 第一步：安装NFS和rpc。
```shell
[root@localhost ~]# yum install -y  nfs-utils   
#安装nfs服务
[root@localhost ~]# yum install -y rpcbind
#安装rpc服务

```
- 第二步：启动服务和设置开启启动：
> 注意：先启动rpc服务，再启动nfs服务。
```shell
[root@localhost ~]# systemctl start rpcbind    #先启动rpc服务
[root@localhost ~]# systemctl enable rpcbind   #设置开机启动
[root@localhost ~]# systemctl start nfs-server nfs-secure-server      
#启动nfs服务和nfs安全传输服务(nfs-secure-server 可不需要)
[root@localhost ~]# systemctl enable nfs-server nfs-secure-server
# 设置开启启动(nfs-secure-server 可不需要)

```
 > 配置防火墙
```shell
[root@localhost /]# firewall-cmd --permanent --add-service=rpc-bind
success   #配置防火墙放行rpc-bind服务
[root@localhost /]# firewall-cmd --permanent --add-service=nfs
success   #配置防火墙放行nfs服务 (未开启报错： clnt_create: RPC: Port mapper failure - Unable to receive: errno 113 (No route to host))
[root@localhost /]# firewall-cmd --permanent --add-service=mountd
success   #配置防火墙放行mountd服务（未开启报错: rpc mount export: RPC: Unable to receive; errno = No route to host）
[root@localhost /]# firewall-cmd  --reload 
success

```
- 第三步：配置共享文件目录，编辑配置文件：
  1. 首先创建共享目录，然后在/etc/exports配置文件中编辑配置即可。
```shell
[root@localhost /]# mkdir /public
#创建public共享目录
[root@localhost /]# vi /etc/exports
	/public 192.168.245.0/24(rw)
	/protected 192.168.245.0/24(ro)
[root@localhost /]# systemctl reload nfs 
#重新加载NFS服务，使配置文件生效(取其一执行即可)
[root@localhost /]# exportfs -rv
#暴露NFS服务，使配置文件生效(取其一执行即可)

```
## NFS客户端挂载配置：
- 第一步：使用showmount命令查看nfs服务器共享信息。输出格式为“共享的目录名称 允许使用客户端地址”。
```shell
yum -y install nfs-utils
# 安装nfs-utils客户端
[root@localhost ~]# showmount -e 192.168.245.128      
Export list for 192.168.245.128:
/protected 192.168.245.0/24
/public    192.168.245.0/24

```
- 第二步，在客户端创建目录，并挂载共享目录。
```shell
[root@localhost ~]# mkdir /mnt/public
[root@localhost ~]# mkdir /mnt/data
[root@localhost ~]# vim /etc/fstab 
#在该文件中挂载，使系统每次启动时都能自动挂载
	192.168.245.128:/public  /mnt/public       nfs    defaults 0 0
	192.168.245.128:/protected /mnt/data     nfs    defaults  0 1
[root@localhost ~]# mount -a   #是文件/etc/fstab生效

```
- 第三步：检查：
```shell
showmount -e 192.168.56.103
# 查看是否有权限访问
[root@mail ~]# df -Th
# 查看挂载情况
Filesystem                 Type      Size  Used Avail Use% Mounted on
/dev/mapper/rhel-root      xfs        17G  3.1G   14G  18% /
devtmpfs                   devtmpfs  1.4G     0  1.4G   0% /dev
tmpfs                      tmpfs     1.4G  140K  1.4G   1% /dev/shm
tmpfs                      tmpfs     1.4G  9.1M  1.4G   1% /run
tmpfs                      tmpfs     1.4G     0  1.4G   0% /sys/fs/cgroup
/dev/sda1                  xfs      1014M  173M  842M  18% /boot
tmpfs                      tmpfs     280M   32K  280M   1% /run/user/0
/dev/sr0                   iso9660   3.6G  3.6G     0 100% /mnt/cdrom
192.168.245.128:/public    nfs4       17G  3.7G   14G  22% /mnt/public
192.168.245.128:/protected nfs4       17G  3.7G   14G  22% /mnt/data

```
