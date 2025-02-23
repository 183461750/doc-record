# 定制化 SSH VPN 专用服务器方案

> PS: 没啥用, 仅供参考

---

### 定制化 SSH VPN 专用服务器方案

针对「服务器仅用于 SSH VPN」的场景，以下是优化后的安全实施方案，实现 **客户端零配置** + **服务器自动鉴权**：

---

### 一、服务器端配置（一次性操作）

#### 1. 创建专用 VPN 用户
```bash
sudo useradd -r -s /usr/sbin/nologin vpn-tunnel  # 创建无登录权限的系统用户
sudo mkdir -p /home/vpn-tunnel/.ssh
```

#### 2. 生成服务器专用密钥对
```bash
# 在服务器上生成密钥（仅需执行一次）
sudo ssh-keygen -t ed25519 -f /etc/ssh/vpn-server-key -N "" -C "vpn-server@company"

# 设置权限
sudo chmod 600 /etc/ssh/vpn-server-key*
```

#### 3. 配置自动授权
```bash
# 将公钥设为 VPN 用户的唯一授权方式
sudo cp /etc/ssh/vpn-server-key.pub /home/vpn-tunnel/.ssh/authorized_keys
sudo chown -R vpn-tunnel:vpn-tunnel /home/vpn-tunnel/.ssh
```

#### 4. 加固 SSH 配置 (`/etc/ssh/sshd_config`)
```bash
# 限制 VPN 用户权限
Match User vpn-tunnel
   AllowTcpForwarding no         # 禁用端口转发
   PermitTunnel yes              # 允许创建隧道
   ForceCommand /bin/false       # 禁止执行任何命令
   AuthenticationMethods publickey
   PermitRootLogin no
   X11Forwarding no
   AllowAgentForwarding no
```

#### 5. 应用配置
```bash
sudo systemctl restart sshd
```

---

### 二、客户端零配置连接方案

#### 方案 A：预共享密钥（适合内网可信环境）
1. **获取服务器私钥**：  
   将服务器生成的 `/etc/ssh/vpn-server-key` 私钥分发给客户端，保存为 `~/.ssh/vpn-default-key`

2. **建立连接**：  
   ```bash
   sshuttle --ssh "ssh -i ~/.ssh/vpn-default-key" -r vpn-tunnel@10.0.1.90 0.0.0.0/0
   ```

#### 方案 B：证书认证（更安全，适合生产环境）
```bash
# 在服务器上生成 CA 证书
sudo ssh-keygen -t ed25519 -f /etc/ssh/ca_key -N ""

# 签署 VPN 用户证书（有效期 30 天）
sudo ssh-keygen -s /etc/ssh/ca_key -I "vpn-cert" -n vpn-tunnel -V +30d /home/vpn-tunnel/.ssh/authorized_keys

# 客户端只需信任 CA 公钥即可连接
```

---

### 三、自动化连接脚本

#### 创建一键连接脚本 `vpn-connect`
```bash
#!/bin/bash
SERVER_IP="10.0.1.90"
TUN_KEY="vpn-default-key"

# 自动检测本地密钥
if [ ! -f ~/.ssh/$TUN_KEY ]; then
  echo "下载默认 VPN 密钥..."
  curl -s https://internal.company.com/vpn-keys/$TUN_KEY > ~/.ssh/$TUN_KEY
  chmod 600 ~/.ssh/$TUN_KEY
fi

# 静默启动 VPN
sshuttle --ssh "ssh -i ~/.ssh/$TUN_KEY -o StrictHostKeyChecking=no" \
  -r vpn-tunnel@$SERVER_IP 0.0.0.0/0 \
  --daemon --pidfile /tmp/sshuttle.pid

echo "VPN 已启动 (PID: $(cat /tmp/sshuttle.pid))"
```

---

### 四、安全增强措施

| 安全层级          | 实施方法                                                                 |
|-------------------|-------------------------------------------------------------------------|
| **网络隔离**       | 服务器绑定 VPN 专用网卡，仅开放 SSH 端口                                 |
| **密钥轮换**       | 通过 cron 每周自动更新服务器密钥，客户端脚本同步获取新密钥               |
| **连接审计**       | 服务器记录所有 VPN 连接日志到 `/var/log/ssh-vpn.log`                    |
| **流量限制**       | 使用 iptables 限制每个客户端的带宽和并发连接数                          |
| **双因子认证**     | 集成 Google Authenticator 实现动态口令（需修改 SSH PAM 配置）           |

---

### 五、方案优势对比

| 特性                | 预共享密钥方案       | 证书认证方案           |
|---------------------|----------------------|------------------------|
| 部署复杂度          | 低（适合小型团队）   | 中（需要 CA 管理）     |
| 安全性              | 依赖密钥保管         | 自动过期 + 吊销列表    |
| 客户端更新需求      | 密钥变更需重新分发   | 无需更新客户端         |
| 适合场景            | 内部测试/临时使用    | 生产环境/长期运维      |

---

### 六、运维监控建议

1. **状态检查脚本** (`check-vpn.sh`)
```bash
#!/bin/bash
# 检查活跃连接
netstat -tn | grep ':22' | grep ESTABLISHED

# 监控流量
vnstat -i tun0 -tr 5

# 自动重启（如果进程不存在）
pgrep sshuttle || /path/to/vpn-connect
```

2. **Prometheus 监控指标**
```yaml
# 暴露 SSH 隧道指标
- job_name: 'ssh_vpn'
  static_configs:
    - targets: ['10.0.1.90:9100']
  metrics_path: /probe
  params:
    module: [ssh_tunnel]
```

---

### 七、应急预案

1. **快速封锁用户**
```bash
# 实时移除授权
sudo sed -i '/user-pubkey/d' /home/vpn-tunnel/.ssh/authorized_keys
```

2. **紧急切换端口**
```bash
# 使用 socat 临时重定向流量
socat TCP-LISTEN:2222,fork TCP:10.0.1.90:22
```

3. **全流量捕获分析**
```bash
sudo tcpdump -i tun0 -w vpn-traffic.pcap
```

---

通过此方案，您将获得：
- **客户端**：无需管理密钥，一键连接
- **服务端**：自动化的密钥生命周期管理
- **安全**：企业级防护与监控能力
- **运维**：完善的应急和审计机制

可根据实际需求选择预共享密钥或证书认证方案，平衡安全性与易用性。
