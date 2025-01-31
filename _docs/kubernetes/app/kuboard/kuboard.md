---
---
layout: default
title: doc
nav_order: 13
description: kuboard使用
parent: app
has_children: false
permalink: "/kubernetes/app/kuboard/kuboard/"
---

# kuboard使用

## 使用helm的方式部署

```bash
# 添加Kuboard的Helm仓库。在命令行中执行以下命令
helm repo add kuboard https://kuboard.cn/charts
helm repo update
# 创建一个命名空间用于安装Kuboard。
kubectl create namespace kuboard
# 安装Kuboard。
helm install kuboard kuboard/kuboard --namespace kuboard
# 等待安装完成。您可以使用以下命令检查Kuboard的安装状态：
kubectl get pods -n kuboard
# 访问Kuboard。您可以使用以下命令获取Kuboard的访问地址：
kubectl get svc -n kuboard
```
