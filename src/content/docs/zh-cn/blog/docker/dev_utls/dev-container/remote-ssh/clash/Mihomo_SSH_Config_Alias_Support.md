---
title: Mihomo SSH Config Alias Support
date: 2025-12-07
---
<!-- truncate -->

## 🔗 项目信息

- **Fork 仓库**: [https://github.com/iuin8/mihomo](https://github.com/iuin8/mihomo)
- **分支**: (请确保查看包含 `ssh-config-alias` 功能的分支, 例如: `ssh_system_v1.19.17`)
- **核心文件**: `adapter/outbound/ssh.go`, `adapter/outbound/ssh_system.go`

## 📖 需求背景

在复杂的网络环境中，用户往往已经维护了一套完善的 SSH 配置文件 (`~/.ssh/config`)。这些配置可能包含：

1.  **ProxyJump (跳板机)**：需要通过一台或多台跳板机才能访问目标内网服务器。
2.  **ProxyCommand**：使用第三方认证工具（如 Cloudflare Access, AWS SSM）建立连接。
3.  **IdentityFile**：针对不同主机使用不同的密钥文件。
4.  **Host 别名**：使用简短的别名代替长 IP 或域名。

原有的 Mihomo SSH 适配器使用 Go 语言原生 SSH 库，无法直接利用这些系统级配置，导致用户必须把复杂的跳板逻辑手动转化为 Mihomo 的代理链（Dialer Proxy），配置繁琐且不支持部分高级指令（如特殊的 ProxyCommand）。

**目标**：让 Mihomo 可以直接"借用"系统 SSH 客户端的能力，只需填一个主机别名（如 `my-server`），剩下的认证、跳转全交给系统 SSH 处理。

## ✨ 功能特性

### 1. 完整 SSH Config 支持
通过调用系统 `ssh` 命令建立隧道，Mihomo 可以支持系统 SSH 客户端支持的所有指令：
- ✅ `ProxyJump` / `JumpHost`
- ✅ `ProxyCommand` (支持 cloudflared, nc 等)
- ✅ `IdentityFile`, `User`, `Port` 等自动读取
- ✅ `Match`, `Include` 等高级配置逻辑

### 2. 智能用户切换 (`sudo -u`)
Mihomo 通常以 **root** 权限运行（为了 TUN 模式等），而用户的 SSH 配置位于普通用户目录下。本功能实现了：
- 自动检测或指定实际用户。
- 使用 `sudo -u <user> -i` 切换身份执行 SSH。
- **`-i` 参数**确保加载用户的完整登录环境（`PATH`），保证 `cloudflared` 等命令可被找到。

### 3. 零配置密钥
无需在 Mihomo 配置文件中填入私钥内容，它会自动读取 `~/.ssh/id_rsa` 或配置中指定的 `IdentityFile`。

## 🚀 使用方式

### 参数说明

| 字段 | 说明 |
|------|------|
| `type` | 必须为 `ssh` |
| `server` | **关键**：填写 `~/.ssh/config` 中的 `Host` 别名 |
| `port` | **注意**：填写目标服务**内部**监听端口（通常是 **22**）。<br>⚠️ 不要填 `~/.ssh/config` 中的映射端口。 |
| `use-ssh-config-alias` | 设置为 `true` 开启此功能 |
| `ssh-user` | 指定本地执行 SSH 命令的用户名（你的 macOS/Linux 用户名） |

### 配置示例

#### 场景 1：基础跳板机 (ProxyJump)

**SSH Config (`~/.ssh/config`)**:
```ssh-config
Host bastion
  HostName 1.2.3.4
  User admin

Host internal-db
  HostName 10.0.0.5
  User root
  ProxyJump bastion  # 自动经过 bastion 跳转
```

**Mihomo 配置**:
```yaml
proxies:
  - name: "Internal-DB-SSH"
    type: ssh
    server: "internal-db"      # 直接填别名
    port: 22                   # 目标内部 SSH 端口
    use-ssh-config-alias: true
    ssh-user: "your-username"  # 你的本地用户名
```

#### 场景 2：Cloudflare Access (ProxyCommand)

**SSH Config**:
```ssh-config
Host my-cf-server
  HostName ssh.example.com
  User root
  # 需要 cloudflared 命令在 PATH 中
  ProxyCommand cloudflared access ssh --hostname %h
```

**Mihomo 配置**:
```yaml
proxies:
  - name: "CF-SSH"
    type: ssh
    server: "my-cf-server"
    port: 22
    use-ssh-config-alias: true
    ssh-user: "your-username"
```

## 🛠 原理简述

Mihomo 收到连接请求后，会在底层执行类似以下的命令：

```bash
sudo -u your-username -i ssh -W localhost:22 my-host-alias
```

这条命令会建立一个标准输入/输出到目标 SSH 端口的 TCP 隧道。Mihomo 随后在这个隧道上进行自己的 SSH 协议握手，建立代理连接。
