---
layout: default
title: doc
nav_order: 16
description: 注入代理相关文档
parent: Inject
has_children: false
permalink: "/kubernetes/app/skywalking/java/k8s/inject/inject/"
grand_parent: K8s
---

# 注入代理相关文档

## 前置条件

已经安装了[cert-manager](https://github.com/183461750/doc-record/blob/4ed197082e57f368c4eebf6b91e9c1260f6ae8c5/k8s/docs/cert-manager/doc.md)

## 安装skywalking-swck-operator

[参考文档](https://github.com/apache/skywalking-swck/blob/master/docs/operator.md)

```bash
# 使用下载的配置(需先解压)(./skywalking-swck)(推荐使用)
kubectl apply -f skywalking-swck-<SWCK_VERSION>-bin/config/operator-bundle.yaml
kubectl apply -f skywalking-swck/skywalking-swck-0.9.0-bin/config/operator-bundle.yaml

# 下面这个方式貌似有问题
kubectl apply -k "github.com/apache/skywalking-swck/operator/config/default"
# or
kubectl apply -k "github.com/apache/skywalking-swck/operator/config/default?ref=v0.8.0"
```

- `gcr.io/kubebuilder/kube-rbac-proxy:v0.8.0`镜像拉不下来的问题处理

[参考文章](https://juejin.cn/post/7099354856078442509)

可以使用`kubesphere/kube-rbac-proxy:v0.8.0`进行替代

```bash
docker pull kubesphere/kube-rbac-proxy:v0.8.0
docker tag kubesphere/kube-rbac-proxy:v0.8.0 gcr.io/kubebuilder/kube-rbac-proxy:v0.8.0
# 或者修改部署配置文件, 改变拉取的镜像
```

## 安装Custom Metrics Adapter

[参考文档](https://github.com/apache/skywalking-swck/blob/master/docs/custom-metrics-adapter.md)
在 skywalking-swck 中，Custom Metrics Adapter 是一个可选组件，用于扩展 SkyWalking 的监控能力。它允许你使用 Kubernetes 的 Custom Metrics API 来收集和展示自定义的监控指标。

```bash
kubectl apply -k "github.com/apache/skywalking-swck/adapter/config"
# or
kubectl apply -k "github.com/apache/skywalking-swck/adapter/config?ref=v0.8.0"
```

## 安装注入代理

```bash
# 启动测试demo应用
kubectl apply -f demo1.yaml
# Label the namespace with swck-injection=enabled
kubectl label namespace skywalking swck-injection=enabled
kubectl -n skywalking patch deployment demo1 --patch '{
    "spec": {
        "template": {
            "metadata": {
                "labels": {
                    "swck-java-agent-injected": "true"
                }
            }
        }
    }
}'
# 查看被打标的pods
kubectl get pod -l swck-java-agent-injected=true
# 查看javaagent
kubectl get javaagent
# 查看javaagent详情
kubectl get javaagent app-demo1-javaagent -o yaml
# Use SwAgent CR to setup override default configuration
kubectl -n skywalking apply -f swagent.yaml
# 查看
kubectl -n skywalking get SwAgent
# 查看并重启
# verify pods to be delete 
kubectl -n skywalking get pods -l app=demo1
# delete pods
kubectl -n skywalking delete pods -l app=demo1
# 到skywalking上应该就能看到这个服务了
```
