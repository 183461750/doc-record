---
layout: default
title: '"Interpreter"'
nav_order: 3
description: interpreter
parent: Terminal
has_children: false
permalink: "/tools/terminal/interpreter/interpreter/"
grand_parent: 工具集
---

# interpreter

[官方文档](https://docs.openinterpreter.com/getting-started/introduction)

## 安装

```bash
pip install open-interpreter
```

## 使用

```bash
interpreter
# 使用本地模型
interpreter --model ollama/<model-name>
# 示例
interpreter --model ollama/qwen2.5-coder
```
