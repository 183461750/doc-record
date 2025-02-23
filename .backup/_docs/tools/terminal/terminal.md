---
layout: default
title: Terminal
nav_order: 12
description: 命令行使用记录文档
parent: Terminal
has_children: false
permalink: "/tools/terminal/terminal/"
grand_parent: Tools
---

# 命令行使用记录文档

## asdf工具(The Multiple Runtime Version Manager多运行时版本管理器)

asdf 确保团队使用完全相同版本的工具，通过插件系统支持许多工具，并且作为包含在 Shell 配置中的单个 Shell 脚本的简单性和熟悉性。
asdf 不打算成为系统包管理器。它是一个工具版本管理器。仅仅因为您可以为任何工具创建插件并使用 asdf 管理其版本，并不意味着这是该特定工具的最佳行动方案。

[官网地址](https://asdf-vm.com/)

```bash
# 安装
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.14.0
# 配置环境变量
code ~/.zshrc
. "$HOME/.asdf/asdf.sh"
. "$HOME/.asdf/completions/asdf.bash"
# 查询插件
asdf plugin list all | grep python
# 安装插件
asdf plugin add python https://github.com/danhper/asdf-python.git
# 安装python
asdf install python latest
# 设置版本
asdf global python latest
```

## Nix工具

Nix，纯粹的函数式包管理器

Nix 是一个强大的包管理器，适用于 Linux 和其他 Unix 系统，它使包管理可靠且可重现。
[官网地址](https://nixos.org/nix/)
