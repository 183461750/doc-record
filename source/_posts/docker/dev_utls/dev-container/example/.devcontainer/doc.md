---
layout: "default"
title: "doc"
nav_order: 15
description: "devcontainer记录"
parent: "example"
has_children: false
permalink: "/docker/dev_utls/dev-container/example/.devcontainer/doc/"
---

# devcontainer记录

关于卷挂载

```shell
"mounts": [
		"source=/Users/fa/.ssh,target=/root/.ssh,type=bind,consistency=cached"
	],
```

关于ssh密钥共享
[参考文章](https://code.visualstudio.com/remote/advancedcontainers/sharing-git-credentials)
[ssh-add使用](https://raw.githubusercontent.com/183461750/doc-base/d97d6b14491ec2bcbc36bc487b3b237e653b1736/me/records/os/linux/remote.md?token=GHSAT0AAAAAACHFDDN6JNMW2C7PMWBS44QYZTPVHDA)
   需要通过ssh-add检查是否添加了对应需要共享的密钥

```shell
# 首先，通过在终端中运行以下命令在后台启动 SSH 代理：
eval "$(ssh-agent -s)"
# 然后将这些行添加到您的 ~/.bash_profile 或 ~/.zprofile （对于 Zsh），以便它在登录时启动：
if [ -z "$SSH_AUTH_SOCK" ]; then
   # Check for a currently running instance of the agent
   RUNNING_AGENT="`ps -ax | grep 'ssh-agent -s' | grep -v grep | wc -l | tr -d '[:space:]'`"
   if [ "$RUNNING_AGENT" = "0" ]; then
        # Launch a new instance of the agent
        ssh-agent -s &> $HOME/.ssh/ssh-agent
   fi
   eval `cat $HOME/.ssh/ssh-agent`
fi
```
