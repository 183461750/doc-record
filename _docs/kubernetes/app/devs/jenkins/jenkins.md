---
layout: default
title: '"doc"'
nav_order: 14
description: jenkins的使用
parent: devs
has_children: false
permalink: "/kubernetes/app/devs/jenkins/jenkins/"
---

# jenkins的使用

## helm方式部署

```bash
# 添加Jenkins仓库：
helm repo add jenkinsci https://charts.jenkins.io && helm repo update
# 部署Jenkins：
helm install jenkins jenkinsci/jenkins
# 检查Jenkins：使用helm list命令检查Jenkins的部署状态，并使用kubectl get pod命令检查Jenkins的Pod状态
# 查看ip和端口
kubectl get svc jenkins
# 端口映射
kubectl --namespace default port-forward svc/jenkins 8080:8080
# 查看备注信息
helm get notes jenkins

# 卸载Jenkins
helm uninstall jenkins
```
