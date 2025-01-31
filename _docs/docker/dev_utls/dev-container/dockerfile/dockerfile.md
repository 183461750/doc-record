---
---
layout: default
title: doc
nav_order: 14
description: dockerfile文件相关记录
parent: dev-container
has_children: false
permalink: "/docker/dev_utls/dev-container/dockerfile/dockerfile/"
---

# dockerfile文件相关记录

## 开启ssh的centos发行版

- [参考文章](https://raw.githubusercontent.com/183461750/doc-record/main/materiel/ai/docker/%E5%BC%80%E5%90%AFssh%E7%9A%84centos%E5%8F%91%E8%A1%8C%E7%89%88%E7%9A%84Dockerfile.md)

```dockerfile
# 使用官方 CentOS 基础镜像(PS: latest版拉取openssh-server依赖报错)
FROM centos:centos7.9.2009
# 安装 SSH 服务
RUN yum install -y openssh-server
# 生成 SSH 密钥
RUN ssh-keygen -t rsa -f /etc/ssh/ssh_host_rsa_key -N ''
RUN ssh-keygen -t ecdsa -f /etc/ssh/ssh_host_ecdsa_key -N ''
RUN ssh-keygen -t ed25519 -f /etc/ssh/ssh_host_ed25519_key -N ''
# 设置 root 密码
RUN echo "root:password" | chpasswd
# 配置 SSH 服务
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
# 暴露 SSH 端口
EXPOSE 22
# 启动 SSH 服务
CMD ["/usr/sbin/sshd", "-D"]
```
