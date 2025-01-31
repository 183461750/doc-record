---
layout: "default"
title: "docker-compose服务间依赖通过自定义健康检查实现顺序启动"
nav_order: 13
description: "docker-compose服务间依赖通过自定义健康检查实现顺序启动"
parent: "doc"
has_children: false
permalink: "/docker/doc/article/docker-compose服务间依赖通过自定义健康检查实现顺序启动/"
---

# docker-compose服务间依赖通过自定义健康检查实现顺序启动

Docker Compose中的`condition: service_healthy`配置是用来判断依赖的服务是否健康的。当一个服务依赖于另一个服务时，可以使用`depends_on`和`condition: service_healthy`来确保依赖的服务已经健康启动。

下面是关于如何判断服务是否健康的一些相关内容：

1. 健康检查命令：在Dockerfile或docker container run命令中，可以使用`HEALTHCHECK`来定义容器的健康检查命令[[1]](https://blog.csdn.net/weixin_48447848/article/details/122632562)。健康检查命令可以是任何能够返回0或非0退出代码的命令，例如使用`curl`命令检查服务是否可访问。

2. 健康检查参数：健康检查命令可以使用一些参数来配置检查的间隔、超时和重试次数等。常用的健康检查参数包括：
   - `--interval`：指定检查的间隔时间，默认为30秒。
   - `--timeout`：指定每次检查的超时时间，默认为30秒。
   - `--retries`：指定连续失败的次数后将服务标记为不健康，默认为3次。
   - `--start-period`：指定容器启动后等待健康检查开始的时间，默认为0秒。

3. `condition: service_healthy`配置：在Docker Compose中，可以使用`condition: service_healthy`来指定依赖的服务是否健康。当依赖的服务的健康状态为健康时，才会启动当前的服务。这样可以确保依赖的服务已经成功启动并且可用。

下面是一个示例的docker-compose.yml文件，演示了如何使用健康检查和`condition: service_healthy`来判断服务是否健康并依次启动：

```yaml
version: "3.8"

services:
  flask:
    build:
      context: ./flask
      dockerfile: Dockerfile
    image: flask-demo:latest
    environment:
      - REDIS_HOST=redis-server
      - REDIS_PASS=${REDIS_PASSWORD}
    healthcheck: 
      test: ["CMD", "curl", "-f", "http://localhost:5000"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    depends_on:
      redis-server:
        condition: service_healthy
    networks:
      - backend
      - frontend

  redis-server:
    image: redis
```

在上述示例中，flask服务依赖于redis-server服务。flask服务的健康检查命令是使用`curl`命令检查`http://localhost:5000`是否可访问。只有当redis-server服务的健康状态为健康时，flask服务才会启动。

---
Learn more:

1. [【Docker系列】Docker Compose 服务依赖和健康检查_docker-compose healthcheck-CSDN博客](https://blog.csdn.net/weixin_48447848/article/details/122632562)
2. [[docker]-docker-compose通过healthcheck判断容器状态并依次启动_docker-compose healthcheck-CSDN博客](https://blog.csdn.net/xujiamin0022016/article/details/123642210)
3. [Docker compose 服务依赖关系及健康检查 - 掘金](https://juejin.cn/post/7250374485567619131)

## 参考内容

- [nocodb部署yml](https://github.com/nocodb/nocodb/blob/develop/docker-compose/pg/docker-compose.yml)
  
