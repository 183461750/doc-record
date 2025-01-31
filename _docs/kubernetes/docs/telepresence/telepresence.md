---
layout: default
title: '"doc"'
nav_order: 13
description: Telepresence 使用记录
parent: docs
has_children: false
permalink: "/kubernetes/docs/telepresence/telepresence/"
---

# Telepresence 使用记录

## Telepresence Quick Start

[Telepresence Quick Start](https://www.getambassador.io/docs/telepresence/latest/quick-start?os=macos)

## kubectl通过kubeconfig连接集群

```shell
# 设置集群
kubectl config set-cluster ocms-dsu --kubeconfig ~/dev/projects/IdeaProjects/company/ssy/lingxi/outsource-deploy/snow/ocms-dsu.yaml
kubectl config set-context ocms-dsu --kubeconfig ~/dev/projects/IdeaProjects/company/ssy/lingxi/outsource-deploy/snow/ocms-dsu.yaml
# 查看当前集群
kubectl config current-context

```

## 相关疑问

`git clone https://github.com/ambassadorlabs/telepresence-local-quickstart.git --recurse-submodules`
    - 关于这个命令中的`--recurse-submodules`作用是啥?
        确保在克隆主项目的同时，其依赖的所有子模块也被克隆并设置好，以便开发者可以直接开始工作，而无需手动初始化和更新子模块。
