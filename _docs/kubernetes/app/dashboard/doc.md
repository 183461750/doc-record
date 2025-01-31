---
layout: "default"
title: "doc"
nav_order: 13
description: "k8s dashboard"
parent: "app"
has_children: false
permalink: "/kubernetes/app/dashboard/doc/"
---

# k8s dashboard

## 部署 Dashboard UI

```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml

```

## 创建用户

```shell
# dashboard-ClusterRoleBinding.yaml
kubectl apply -f dashboard-ClusterRoleBinding.yaml
# dashboard-ServiceAccount.yaml
kubectl apply -f dashboard-ServiceAccount.yaml
# Getting a Bearer Token
kubectl -n kubernetes-dashboard create token admin-user
# Clean up and next steps
kubectl -n kubernetes-dashboard delete serviceaccount admin-user
kubectl -n kubernetes-dashboard delete clusterrolebinding admin-user
```

## 命令行代理

```shell
kubectl proxy
# PS: kubectl 会使得 Dashboard 可以通过 http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/ 访问。

```

## 部署MySQL

```yaml
# ./deploy/mysql.yml
```
