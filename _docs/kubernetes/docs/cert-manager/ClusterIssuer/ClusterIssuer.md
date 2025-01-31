---
layout: default
title: doc
nav_order: 14
description: ClusterIssuer记录
parent: cert-manager
has_children: false
permalink: "/kubernetes/docs/cert-manager/clusterissuer/clusterissuer/"
---

# ClusterIssuer记录

```bash
# 安装
kubectl apply -f ClusterIssuer.yaml
# 查看(kuboard中的集群管理->自定义资源->cert-manager.io中也能看到)
kubectl get ClusterIssuer
```

- [参考](https://help.aliyun.com/zh/ack/ack-managed-and-ack-dedicated/user-guide/advanced-nginx-ingress-configurations#title-v89-nee-iuh)

```bash
# 创建ClusterIssuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod-http01
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: <your_email_name@gmail.com>  # 替换为您的邮箱名。
    privateKeySecretRef:
      name: letsencrypt-http01
    solvers:
    - http01: 
        ingress:
          class: nginx
EOF
# 查看ClusterIssuer
kubectl get clusterissuer
# 创建Nginx Ingress资源对象
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-tls
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod-http01"
spec:
  tls:
  - hosts:
    - <your_domain_name>        # 替换为您的域名。
    secretName: ingress-tls   
  rules:
  - host: <your_domain_name>    # 替换为您的域名。
    http:
      paths:
      - path: /
        backend:
          service:
            name: <your_service_name>  # 替换为您的后端服务名。
            port: 
              number: <your_service_port>  # 替换为您的服务端口。
        pathType: ImplementationSpecific
EOF
```
