---
layout: "default"
title: "docker compose 中 , 当我配置了副本的时候, IP怎么固定"
nav_order: 15
description: "docker compose 中 , 当我配置了副本的时候, IP怎么固定"
parent: "ai"
has_children: false
permalink: "/docker/doc/material/ai/docker/docker compose 中 , 当我配置了副本的时候, IP怎么固定/"
---

# docker compose 中 , 当我配置了副本的时候, IP怎么固定

在Docker Compose中，当配置了副本（replicas）时，容器的IP地址是动态分配的，无法直接固定。然而，可以通过一些方法来实现类似固定IP的效果。

以下是一种可能的解决方案：

1. 使用Overlay网络：创建一个Overlay网络，并指定一个自定义的子网。通过这种方式，可以控制容器的IP地址范围，避免与Docker引擎分配的IP地址冲突[[3]](https://gist.github.com/olljanat/b96ed26583c452118313fc18e4a663c1)。

   ````yaml
   version: "3.9"
   
   networks:
     mynetwork:
       driver: overlay
       ipam:
         config:
           - subnet: 10.0.0.0/24
   ```

2. 自定义Docker镜像：创建一个自定义的Docker镜像，该镜像在容器启动时可以设置固定的IP地址。可以在Dockerfile中添加相应的配置，例如使用ifconfig命令设置容器的IP地址[[3]](https://gist.github.com/olljanat/b96ed26583c452118313fc18e4a663c1)。

   ````Dockerfile
   FROM ubuntu
   RUN apt-get update && apt-get install -y net-tools iputils-ping
   COPY start.sh /
   ENTRYPOINT /start.sh
   ```

   ````bash
   # start.sh
   #!/bin/bash
   if [[ -f "${STATIC_IP}" ]]; then
       echo "Using default IP from Docker"
   else
       echo "Found static IP: ${STATIC_IP}, using it"
       ifconfig eth0 ${STATIC_IP} netmask 255.255.255.0 up
   fi
   sleep infinity
   ```

3. 启动容器：在Docker Compose文件中，使用`cap-add=NET_ADMIN`参数启动容器，并将其连接到Overlay网络。通过设置`STATIC_IP`环境变量，可以将容器的IP地址设置为固定值[[3]](https://gist.github.com/olljanat/b96ed26583c452118313fc18e4a663c1)。

   ````yaml
   version: "3.9"
   
   services:
     myservice:
       image: static-ip
       networks:
         - mynetwork
       environment:
         - STATIC_IP=10.0.0.11
       deploy:
         replicas: 2
         placement:
           constraints:
             - node.role == worker
   ```

请注意，以上解决方案仅提供了一种可能的方法，具体实现方式可能因环境和需求而有所不同。建议根据实际情况进行调整和测试。

---
Learn more:

1. [Provide static IP to docker containers via docker-compose - Stack Overflow](https://stackoverflow.com/questions/39493490/provide-static-ip-to-docker-containers-via-docker-compose)
2. [It is useless for fixing the ip of container for Swarm after enabling the replicas - Swarm - Docker Community Forums](https://forums.docker.com/t/it-is-useless-for-fixing-the-ip-of-container-for-swarm-after-enabling-the-replicas/121998)
3. [Overlay network and static IPs for Docker containers · GitHub](https://gist.github.com/olljanat/b96ed26583c452118313fc18e4a663c1)
