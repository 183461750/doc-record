# sshuttle

[github地址](https://github.com/sshuttle/sshuttle)

```bash
# 安装
brew install sshuttle

# 配置本地mac免密
sshuttle --sudoers-no-modify
# 执行后会打印配置内容
# 执行以下命令, 将配置内容写入到以下文件中
visudo /etc/sudoers.d/sshuttle_auto

# 免密使用(fa为免密用户, 需指定)(配合ssh config使用)
# PS: 貌似并没有免密
sshuttle --sudoers-user fa -r jump.local.container2222-sshuttle.fa.intranet.company 10.0.1.0/24

```

```bash

# 其他使用方式示例
sshuttle -r root@10.0.1.90 --python $(which python3) 0.0.0.0/0

# 成功命令(--python指定的是服务端的python命令, 在服务端安装了python3)
sshuttle -r root@container2222.fa.intranet.company --python /usr/bin/python3 0.0.0.0/0
# 简化版
sshuttle -r container2222.fa.intranet.company 0.0.0.0/0

# 通过内部mac服务器访问网络, mac中连接了其他公司内部VPN, 一下命令实现让本机也能访问受VPN限制的网络
sshuttle -r mac.intranet.company 0.0.0.0/0
# 可以指定代理的域名
sshuttle -r mac.intranet.company baidu.com
```

## 高级操作(客户端零配置功能测试失败)

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
   IdentityFile /etc/ssh/vpn-server-key
```

#### 5. 应用配置

```bash
# 重启sshd
sudo systemctl restart sshd
# 如果没有上面的命令, 则使用下面的方案

# 测试 sshd 配置文件的语法是否正确
/usr/sbin/sshd -t
# 发送 HUP 信号, 促使 sshd 进程重新加载配置。
/usr/sbin/sshd -k HUP
```

### 二、客户端零配置连接方案

#### 方案 B：证书认证（更安全，适合生产环境）

```bash
# 在服务器上生成 CA 证书
sudo ssh-keygen -t ed25519 -f /etc/ssh/ca_key -N ""

# 签署 VPN 用户证书（有效期 30 天）
sudo ssh-keygen -s /etc/ssh/ca_key -I "vpn-cert" -n vpn-tunnel -V +30d /home/vpn-tunnel/.ssh/authorized_keys

# 客户端只需信任 CA 公钥即可连接
```
