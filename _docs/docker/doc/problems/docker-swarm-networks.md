---
layout: "default"
title: "docker-swarm-networks"
nav_order: 13
description: "docker swarm networks"
parent: "doc"
has_children: false
permalink: "/docker/doc/problems/docker-swarm-networks/"
---

# docker swarm networks

## 网段冲突问题解决方案

根据搜索结果，以下是关于如何更改Docker Ingress网络默认子网范围的解决方案：

1. 首先，我们需要确认当前Docker Ingress网络的默认子网范围。可以使用以下命令检查网络配置信息：`docker network inspect ingress` [[1]](https://stackoverflow.com/questions/42954017/how-to-change-ip-address-range-of-docker-swarm-ingress-network)。
2. 如果默认子网范围与您的计算机子网范围冲突，您可以尝试以下方法来更改Docker Ingress网络的子网范围：

   - 方法一：使用Docker Swarm命令行选项来指定子网范围。在初始化或加入Docker Swarm时，可以使用`--default-addr-pool`选项来指定子网范围。例如：`docker swarm init --default-addr-pool 192.168.0.0/16` [[1]](https://stackoverflow.com/questions/42954017/how-to-change-ip-address-range-of-docker-swarm-ingress-network)。
   - 方法二：编辑Docker的守护进程配置文件`daemon.json`来指定子网范围。您可以使用以下步骤进行操作：
     - 使用文本编辑器打开`/etc/docker/daemon.json`文件（在Windows上是`C:\ProgramData\Docker\config\daemon.json`）。
     - 添加以下内容到文件中：
  
       ```json
       {
         "default-address-pools": [
           {"base":"192.168.0.0/16","size":24}
         ]
       }
       ```

       将`192.168.0.0/16`替换为您想要的子网范围。
     - 保存文件并重启Docker服务，以使更改生效。在Linux上，可以使用`sudo systemctl restart docker`命令来重启Docker服务，在Windows上，可以通过Docker桌面界面的"Troubleshoot"选项来重启Docker Desktop [[2]](https://support.hyperglance.com/knowledge/changing-the-default-docker-subnet)。

请注意，更改Docker网络的子网范围可能会影响到已经运行的容器和网络连接，请谨慎操作并确保备份重要数据。

---

Learn more:

1. [networking - How to change ip address range of docker swarm ingress network - Stack Overflow](https://stackoverflow.com/questions/42954017/how-to-change-ip-address-range-of-docker-swarm-ingress-network)
2. [How to change the default docker subnet IP range](https://support.hyperglance.com/knowledge/changing-the-default-docker-subnet)
3. [Changing Docker's default subnet IP range | cylab.be](https://cylab.be/blog/277/changing-dockers-default-subnet-ip-range)

## 宿主机与容器不通问题

```bash
# 方式一：添加路由
# route add -net 192.168.1.0 netmask 255.255.255.0 gw 172.20.0.1 dev docker_gwbridge # dev 是用来指定网络接口的参数。它用于指定要添加路由的网络接口设备。
route add -net <容器IP网段> netmask <容器IP网段的子网掩码> gw <docker_gwbridge的网关IP>  dev docker_gwbridge
  ## 查看路由
route -n

## 更多操作

# 端口转发问题(上面解决了路由的问题，若还有端口访问不通，则按下面方式解决)

# 查看nat转发的规则
iptables -t nat -nvL

# 添加nat转发规则(实现宿主机访问容器中未开放的端口(即docker run时未添加-p参数))
iptables -t nat -A DOCKER -p tcp -m tcp --dport 8088 -j DNAT --to-destination 10.0.0.2:8088
# 删除nat
  ## 查看规则编号
  iptables -t nat -nL --line-number
  ## 删除编号
  iptables -t nat -D DOCKER 4 
```
