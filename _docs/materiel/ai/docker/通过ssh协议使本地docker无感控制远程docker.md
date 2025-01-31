---
layout: default
title: 通过ssh协议使本地docker无感控制远程docker
nav_order: 13
description: idea中Preparing Docker SSH environment...是怎么准备环境的? 原理是啥? 我要如何操作才能通过ssh的方式在本地通过docker命令远程控制内网docker
parent: ai
has_children: false
permalink: "/materiel/ai/docker/通过ssh协议使本地docker无感控制远程docker/"
---

# idea中Preparing Docker SSH environment...是怎么准备环境的? 原理是啥? 我要如何操作才能通过ssh的方式在本地通过docker命令远程控制内网docker

在使用 IntelliJ IDEA 进行 Docker 开发时，IDEA 支持通过 SSH 连接到远程 Docker 环境。当你在 IDEA 中看到 “Preparing Docker SSH environment...” 这样的提示时，通常意味着 IDEA 正在设置通过 SSH 代理来与远程 Docker 宿主机进行通信。

## SSH 环境的准备过程

1. **启动远程 Docker 服务**: 首先，需要在远程宿主机上启动 Docker 服务，并且确保远程宿主机上安装了 SSH 服务。
2. **配置 SSH 密钥**: 在本地机器和远程宿主机之间需要有一对 SSH 密钥（通常是 `id_rsa` 和 `id_rsa.pub`），用于无密码登录。
3. **设置 SSH 代理**: IDEA 使用一个名为 `idea-docker-ssh` 的内部工具，通过 SSH 隧道将本地 Docker 客户端的请求转发到远程宿主机的 Docker 服务。
4. **建立连接**: 当 IDEA 检测到你想要通过 SSH 连接到远程 Docker 环境时，它会自动尝试使用配置好的 SSH 密钥和宿主机的 IP 地址来建立连接。

## 原理

- **SSH 隧道**: 通过 SSH 隧道技术，本地 Docker 客户端与远程宿主机之间的通信被加密并转发。

- **Docker 远程 API**: 一旦通过 SSH 建立连接，本地 Docker 客户端会通过远程 API 与远程宿主机的 Docker 服务进行交互。

## 在本地通过 SSH 控制内网 Docker

要通过 SSH 在本地控制内网中的 Docker 宿主机，你需要确保以下条件满足：

1. **远程宿主机配置**:

   - 确保 Docker 服务正在运行。
   - 确保宿主机上的 SSH 服务已安装并允许无密码登录（通过 `ssh-copy-id` 或 `ssh-agent`）。
   - 确保防火墙和端口转发设置允许 SSH 连接。
2. **本地机器配置**:
   - 拥有对远程宿主机的 SSH 密钥。
   - 安装并配置 `idea-docker-ssh` 工具（通常 IDEA 会自动处理这一步骤）。
3. **在 IDEA 中配置**:
   - 在 IDEA 中，打开 "Preferences"（或 "Settings"），然后找到 Docker 设置。
   - 配置 Docker 的远程 URL 为 SSH 协议加上宿主机的 IP 地址和端口。例如： `ssh://<user>@<host>:<port>`。
   - 输入你的 SSH 密钥路径，如果 IDEA 没有自动检测到。
4. **建立连接并操作**:
   - 完成以上设置后，IDEA 应该能够自动建立 SSH 连接和 Docker 环境。
   - 你现在应该可以在 IDEA 中运行 Docker 命令，并对远程 Docker 宿主机上的容器进行操作。
  
## 注意事项

- 确保你拥有访问远程宿主机的权限。
- 确保所有操作符合你所在组织的政策和安全标准。
- 保护好你的 SSH 密钥，不要让它落入未经授权的人手中。
在操作过程中，如果有任何不确定的地方，建议查阅更详细的官方文档或咨询有经验的开发者。
