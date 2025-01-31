---
layout: "default"
title: "doc"
nav_order: 14
description: "logstash使用记录"
parent: "elk"
has_children: false
permalink: "/kubernetes/app/elk/logstash/doc/"
---

# logstash使用记录

## 安装

- helm安装
  - [参考文章](https://segmentfault.com/a/1190000044266596)

```shell
helm repo add bitnami https://charts.bitnami.com/bitnami
helm search repo logstash
helm pull bitnami/logstash

```

- 配置文件
  - [values.yaml](./config/6.0.3-values.yaml)

```shell
helm install -f ./config/6.0.3-values.yaml logstash bitnami/logstash --namespace middleware
helm install logstash bitnami/logstash --namespace middleware

```
