---
layout: default
title: samba
nav_order: 15
parent: Nas
permalink: "/docker/app/devs/data/nas/samba/"
has_children: false
grand_parent: Data
---

```shell
docker run -it \
--name samba_docker \  #为新的容器命一个名，方便启动、停止、删除等操作，毕竟一长串字符不好输入
-p 139:139 \           #将主机的139端口映射到samba_docker这个容器的139端口上
-p 445:445 \           #将主机的445端口映射到samba_docker这个容器的445端口上
-v /home/shares/shareA:/home/shares/shareA \  # 将主机上的共享目录向容器进行映射
-d dperson/samba \     #以dperson/samba这个dockers镜像为模板，建立容器
-w "WORKGROUP" \       #从这里开始是dperson/samba 的参数，上面是docker run 的参数。这里指定了工作组
-u "userA;123456789" \ #为samba服务设置账户和密码
-s "shareA;/home/shares/shareA;yes;no;no;userA;userA;userA"
 
最后一行以分号为间隔，分别是：
共享文件夹的名称；共享在samba容器中的路径；共享名称对所有工作组用户可见；不是只读（也就是说可写）；不允许guest用户；指定共享的所有权用户；指定共享的超级用户；指定具有写权限的用户；
 
至于在共享文件夹中所创建的文件、文件夹的权限，通过：
docker exec -it 4ae45cd4f491 /bin/bash
用vi 修改容器内的samba的配置文档 /etc/samba/smb.conf 即可。
```
```shell
docker run -it --name samba_docker -p 139:139 -p 445:445 -v /home/shares/share:/home/shares/share -d dperson/samba -w "WORKGROUP" -u "user;pwd" -s "share;/home/shares/share;yes;no;no;user;user;user"

```
