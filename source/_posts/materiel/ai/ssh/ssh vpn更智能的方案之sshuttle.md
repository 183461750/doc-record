---
title: sshuttle - 更智能的 SSH VPN 方案
date: 2024-02-24
categories:
  - materiel
  - ai
  - ssh
tags:
  - ssh
  - vpn
  - sshuttle
---

# sshuttle

## 更智能的方案（推荐使用 sshuttle）

如果不需要精细控制 TUN 设备，推荐使用轻量级 SSH VPN 工具：

```bash
# 安装 sshuttle（Python 编写，无需内核驱动）
brew install sshuttle

# 一键启动 VPN（自动处理路由和隧道）
sshuttle -r root@10.0.1.90 --python $(which python3) 0.0.0.0/0
```

效果：

- 所有流量自动通过 SSH 隧道
- 无需手动配置 TUN 设备
- 自动处理路由规则

---

### 两种方案对比

| 特性               | 原生 SSH TUN 方案          | sshuttle 方案               |
|--------------------|---------------------------|----------------------------|
| 配置复杂度         | 高（需手动管理设备）       | 低（一键启动）             |
| 跨平台兼容性       | 依赖 TUN 驱动             | 纯 Python 实现             |
| 流量控制           | 需手动配置路由            | 自动路由所有流量           |
| 系统权限需求       | 需要 root/sudo            | 普通用户权限               |
| 适用场景           | 需要精细控制网络层        | 快速建立全流量 VPN         |

---

### 测试连接

对于原生 SSH TUN 方案：

```bash
# 连接并创建隧道
ssh dev-2023-tunnel

# 验证 macOS 端隧道
ifconfig utun0
# 应看到 10.1.0.1 的 IP

# 测试远程连通性
ping 10.1.0.2
```

---

### 常见问题处理

1. **出现 `utun0: Network is down` 错误**
   - 确认已安装 TUN 驱动
   - 检查 `sudo` 权限是否配置正确

2. **sshuttle 无法启动**
   - 指定 Python3 路径：`--python $(which python3)`
   - 确保远程服务器允许 SSH 端口转发

3. **部分应用不遵循系统路由**
   - 配合使用 `--dns` 参数转发 DNS 请求

   ```bash
   sshuttle -r user@host --dns 0.0.0.0/0
   ```
