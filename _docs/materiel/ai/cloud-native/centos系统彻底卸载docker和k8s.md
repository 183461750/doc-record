---
layout: "default"
title: "centos系统彻底卸载docker和k8s"
nav_order: 13
description: "centos系统彻底卸载docker和k8s"
parent: "ai"
has_children: false
permalink: "/materiel/ai/cloud-native/centos系统彻底卸载docker和k8s/"
---

# centos系统彻底卸载docker和k8s

如果您需要在 CentOS 系统上彻底卸载 Docker 和 Kubernetes (k8s)，可以按照以下步骤操作:

1. 卸载 Docker:

   ```bash
   # 停止 Docker 服务
   systemctl stop docker
   systemctl stop docker.socket

   # 卸载 Docker 软件包
   yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-selinux \
                  docker-engine-selinux \
                  docker-engine

   # 删除 Docker 相关目录
   rm -rf /var/lib/docker
   rm -rf /etc/docker
   ```

2. 卸载 Kubernetes:

   ```bash
   # 停止 Kubernetes 服务
   systemctl stop kubelet
   systemctl stop kube-apiserver
   systemctl stop kube-controller-manager
   systemctl stop kube-scheduler
   systemctl stop kube-proxy

   # 卸载 Kubernetes 软件包
   yum remove kubelet kubeadm kubectl

   # 删除 Kubernetes 相关目录
   rm -rf /etc/kubernetes
   rm -rf /var/lib/etcd
   rm -rf /var/lib/kubelet
   ```

3. 清理残留文件:

   ```bash
   # 删除 Docker 和 Kubernetes 相关的配置文件和日志
   rm -rf /etc/systemd/system/docker.service.d
   rm -rf /etc/systemd/system/kubelet.service.d
   rm -rf /var/log/docker
   rm -rf /var/log/kubernetes
   ```

4. 更新系统配置:

   ```bash
   # 更新 systemd 配置
   systemctl daemon-reload
   systemctl reset-failed
   ```

完成上述步骤后,您的 CentOS 系统应该已经彻底卸载了 Docker 和 Kubernetes。请确保在重新安装这些软件之前,您已经清理干净了系统上的所有相关组件和配置文件。
