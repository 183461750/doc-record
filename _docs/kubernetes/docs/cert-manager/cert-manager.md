---
---
layout: default
title: doc
nav_order: 13
description: cert-manager使用记录
parent: docs
has_children: false
permalink: "/kubernetes/docs/cert-manager/cert-manager/"
---

# cert-manager使用记录

[参考地址](https://cert-manager.io/docs/installation/)

## 安装

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.4/cert-manager.yaml
```

- helm方式安装

```bash
helm repo add jetstack https://charts.jetstack.io --force-update
helm repo update
helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.14.4 \
  # --set installCRDs=true
```

# 卸载

```bash
# 检查
kubectl get Issuers,ClusterIssuers,Certificates,CertificateRequests,Orders,Challenges --all-namespaces
# Uninstalling with Helm
helm --namespace cert-manager delete cert-manager
kubectl delete namespace cert-manager
# Uninstalling with kubectl
kubectl delete -f https://github.com/cert-manager/cert-manager/releases/download/vX.Y.Z/cert-manager.crds.yaml
kubectl delete apiservice v1beta1.webhook.cert-manager.io
```
