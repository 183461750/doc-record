---
layout: default
title: docker镜像源
nav_order: 13
description: docker镜像源
parent: Article
has_children: false
permalink: "/docker/doc/article/docker镜像源/"
grand_parent: Doc
---

# docker镜像源

[参考文章](https://developer.aliyun.com/article/653081)

```bash
# Docker 官方中国区
# https://registry.docker-cn.com
# 网易
# http://hub-mirror.c.163.com
# ustc
# https://docker.mirrors.ustc.edu.cn

# 测试镜像源
docker run --rm hello-world --registry-mirror=https://registry.docker-cn.com
docker run --rm hello-world --registry-mirror=http://hub-mirror.c.163.com
docker run --rm hello-world --registry-mirror=https://docker.mirrors.ustc.edu.cn

docker run --rm node:14.21.1-slim --registry-mirror=https://registry.docker-cn.com
docker run --rm node:14.21.1-slim --registry-mirror=http://hub-mirror.c.163.com
docker run --rm node:14.21.1-slim --registry-mirror=https://docker.mirrors.ustc.edu.cn

```

- 最新可用的docker镜像源
  - docker.fxxk.dedyn.io
    - 顺便研究下Cloudflare Workers的工作原理, 感觉挺有用的
    - [相关博客](https://blog.cmliussss.com/p/CF-Workers-docker.io/)
  - 自己部署的docker镜像源
    - [docker镜像源](https://cf-workers-docker-io-ac6.pages.dev/)
