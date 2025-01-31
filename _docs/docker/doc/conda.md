---
layout: default
title: '"conda"'
nav_order: 12
description: 使用记录
parent: Docker
has_children: false
permalink: "/docker/doc/conda/"
---

# 使用记录

- [conda官网](https://docs.conda.io/en/latest/index.html)

## 安装

```shell
# 下载安装脚本
wget https://repo.anaconda.com/miniconda/Miniconda3-py38_23.1.0-1-Linux-aarch64.sh
# 执行脚本安装
bash bash Miniconda3-py38_23.1.0-1-Linux-aarch64.sh
# 最后，重新打开终端执行下面的命令验证是否安装成功
conda list
# 更新
conda update conda
```

## 创建环境

```shell
conda create -n python3.4 python=3.4

## 示例
`bash
    # create and activate the virtual environment
    conda create --name animated_drawings python=3.8.13
    conda activate animated_drawings

    # clone AnimatedDrawings and use pip to install
    git clone https://github.com/facebookresearch/AnimatedDrawings.git
    cd AnimatedDrawings
    pip install -e .
`

```
