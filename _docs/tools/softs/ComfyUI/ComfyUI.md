---
layout: default
title: ComfyUI
nav_order: 1
description: ComfyUI
parent: Comfyui
has_children: false
permalink: "/tools/softs/comfyui/comfyui/"
grand_parent: Softs
---

# ComfyUI

## 安装

[参考地址](https://docs.comfy.org/get_started/manual_install#mac-arm-silicon)

```bash
# 安装miniconda
curl -fsSL https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-arm64.sh | bash
# Create an environment with Conda.
conda create -n comfyenv
conda activate comfyenv
# Install GPU Dependencies
conda install pytorch-nightly::pytorch torchvision torchaudio -c pytorch-nightly
cd ComfyUI
pip install -r requirements.txt
cd ComfyUI
python main.py

```

> 最后, 我直接拉代码下来在IDE中启动了
