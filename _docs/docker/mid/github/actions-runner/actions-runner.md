---
---
layout: default
title: doc
nav_order: 14
description: actions-runner
parent: github
has_children: false
permalink: "/docker/mid/github/actions-runner/actions-runner/"
---

# actions-runner

## linux arm64版

[GitHub设置路径](https://github.com/183461750/doc-record/settings/actions/runners/new?arch=arm64&os=linux)

Download

```bash
# Create a folder
$ mkdir actions-runner && cd actions-runner
# Download the latest runner package
$ curl -o actions-runner-linux-arm64-2.320.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.320.0/actions-runner-linux-arm64-2.320.0.tar.gz
# Optional: Validate the hash
$ echo "bec1832fe6d2ed75acf4b7d8f2ce1169239a913b84ab1ded028076c9fa5091b8  actions-runner-linux-arm64-2.320.0.tar.gz" | shasum -a 256 -c
# Extract the installer
$ tar xzf ./actions-runner-linux-arm64-2.320.0.tar.gz
```

Configure

```bash
# Create the runner and start the configuration experience
$ ./config.sh --url https://github.com/183461750/doc-record --token AJCNPVIBLPPE3QLBOZQHPALHCPCYW
# Last step, run it!
$ ./run.sh
```

Using your self-hosted runner

```bash
# Use this YAML in your workflow file for each job
runs-on: self-hosted
```
