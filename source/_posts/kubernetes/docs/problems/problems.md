---
layout: default
title: doc
nav_order: 13
description: 问题记录
parent: Problems
has_children: false
permalink: "/kubernetes/docs/problems/problems/"
grand_parent: Docs
---

# 问题记录

Failed to create pod sandbox: rpc error: code = Unknown desc = failed to get sandbox image "k8s.gcr.io/pause:3.2": failed to pull image "k8s.gcr.io/pause:3.2": failed to pull and unpack image "k8s.gcr.io/pause:3.2": failed to resolve reference "k8s.gcr.io/pause:3.2": failed to do request: Head "https://k8s.gcr.io/v2/pause/manifests/3.2": dial tcp 173.194.174.82:443: i/o timeout

```shell
crictl pull registry.cn-hangzhou.aliyuncs.com/google_containers/pause:3.2
ctr -n k8s.io i tag registry.cn-hangzhou.aliyuncs.com/google_containers/pause:3.2 k8s.gcr.io/pause:3.2
```
