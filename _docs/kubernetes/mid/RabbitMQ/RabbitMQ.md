---
layout: default
title: doc
nav_order: 13
description: RabbitMQ相关记录
parent: mid
has_children: false
permalink: "/kubernetes/mid/rabbitmq/rabbitmq/"
---

# RabbitMQ相关记录

## 部署

```bash
# 使用./config/rabbitmq.yaml文件部署
kubectl create -f rabbitmq.yaml --namespace=kube-public
# 查看暴露的端口
kubectl get svc --namespace=kube-public
# 在浏览器中输入：http://10.0.33.203:31199/，访问部署好的RabbitMQ。在登录页面输入用户名和密码（此处初始user/bitnami），系统将会进入RabbitMQ的主页。
```

- helm3安装

```bash
helm repo add stable https://charts.helm.sh/stable
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add ali https://apphub.aliyuncs.com/stable

# 安装
# 设置size为8G
helm install rabbitmq bitnami/rabbitmq --namespace middleware \
--set rabbitmq.username=admin,rabbitmq.password=admin,rabbitmq.persistence.storageClass=local-path,rabbitmq.persistence.size=8G

helm install rabbitmq bitnami/rabbitmq --namespace middleware \
--set auth.username=user,auth.password=admin,persistence.enabled=false

# 卸载
helm uninstall rabbitmq

# 更新
helm upgrade rabbitmq bitnami/rabbitmq --namespace middleware \
--set auth.username=user,auth.password=admin,persistence.enabled=false,auth.tls.enabled=false

```

- Kubernetes Operator方式安装
  - [参考文章](https://www.rabbitmq.com/kubernetes/operator/install-operator)

```bash
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"

# Installation using Helm chart
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-release bitnami/rabbitmq-cluster-operator

# 查看
kubectl get all -n rabbitmq-system
kubectl get customresourcedefinitions.apiextensions.k8s.io | grep rabbit

###### 示例
kubectl apply -f https://raw.githubusercontent.com/rabbitmq/cluster-operator/main/docs/examples/hello-world/rabbitmq.yaml

```
