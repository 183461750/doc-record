# 问题

## 证书问题

> PS: 正常kubeasz应该会有自动处理, 不行再试试这个

```bash
# 安装 cfssl 工具（如果未安装）：
wget https://github.com/cloudflare/cfssl/releases/download/v1.6.3/cfssl_1.6.3_linux_amd64 -O /usr/local/bin/cfssl
wget https://github.com/cloudflare/cfssl/releases/download/v1.6.3/cfssljson_1.6.3_linux_amd64 -O /usr/local/bin/cfssljson
chmod +x /usr/local/bin/cfssl /usr/local/bin/cfssljson
```

```bash
# 创建证书配置文件（示例）：
# 创建工作目录
mkdir -p /etc/ssl/etcd/ssl && cd /etc/ssl/etcd/ssl

# 生成 CA 配置（ca-config.json）
cat > ca-config.json <<EOF
{
  "signing": {
    "default": {
      "expiry": "8760h"
    },
    "profiles": {
      "etcd": {
        "usages": ["signing", "key encipherment", "server auth", "client auth"],
        "expiry": "8760h"
      }
    }
  }
}
EOF

# 生成 CA 证书请求（ca-csr.json）
cat > ca-csr.json <<EOF
{
  "CN": "etcd-ca",
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "L": "Beijing",
      "O": "etcd",
      "OU": "etcd-ca",
      "ST": "Beijing"
    }
  ]
}
EOF

# 生成 CA 证书和私钥
cfssl gencert -initca ca-csr.json | cfssljson -bare ca

# 生成 member-master1 证书请求（注意替换 IP 为你的 etcd 节点 IP）
cat > member-master1-csr.json <<EOF
{
  "CN": "member-master1",
  "hosts": [
    "127.0.0.1",
    "10.0.5.167"  # 这里填你的 etcd 节点实际 IP（从日志中看到的 10.0.5.167）
  ],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "L": "Beijing",
      "O": "etcd",
      "OU": "etcd-member",
      "ST": "Beijing"
    }
  ]
}
EOF

# 生成 member-master1 证书和私钥（使用 CA 签名）
cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=etcd member-master1-csr.json | cfssljson -bare member-master1
```

```bash
# 检查目标文件是否已存在：
ls -l /etc/ssl/etcd/ssl/member-master1.pem  # 应该能看到文件了
```

```bash
# 重启 etcd 服务并验证
# 重启 etcd 服务
systemctl restart etcd.service

# 检查服务状态（查看是否启动成功）
systemctl status etcd.service

# 查看最新日志（确认是否还有错误）
journalctl -u etcd.service -f
```

## 证书问题2

> PS: 这个问题会导致docker拉不了镜像, 其实就是https证书的问题, 影响方面应该挺广的

```bash
# 证书问题
sudo mkdir -p /etc/ssl/certs
sudo chmod 755 /etc/ssl/certs
apt update && sudo apt install ca-certificates
sudo update-ca-certificates
## 如果用了docker 可能还需要重启docker(systemctl restart docker)
```

## kubeasz版本bug(v3.6.7)

- 报bash相关错误

```bash

## 需要注释掉这个检查
  # check bash shell
#   readlink /proc/$$/exe|grep -q "bash" || { logger error "you should use bash shell only"; exit 1; }

```

## kubelet无法启动

kubelet残留问题

```bash
sudo kubeadm reset
sudo apt-get purge -y kubelet kubeadm kubectl
sudo apt-get autoremove -y  # 清理依赖
```

```bash
# 手动清理残留文件（可选，确保彻底卸载）：
# 清理容器网络接口配置
sudo rm -rf /etc/cni/net.d

# 清理 kubelet 工作目录
sudo rm -rf /var/lib/kubelet/

# 清理容器运行时数据（以 containerd 为例，根据实际运行时调整）
sudo systemctl stop containerd
sudo rm -rf /var/lib/containerd/
sudo systemctl start containerd
```

如果是二进制部署的集群（手动安装）

```bash
# 停止 kubelet 服务：
sudo systemctl stop kubelet
sudo systemctl disable kubelet  # 禁止开机启动

# 删除 kubelet 服务配置：
sudo rm -f /etc/systemd/system/kubelet.service
sudo rm -f /etc/systemd/system/kubelet.service.d/*.conf  # 相关配置目录
sudo systemctl daemon-reload  # 重新加载 systemd 配置

# 删除 kubelet 二进制文件和配置：
# 二进制文件路径通常为 /usr/local/bin/kubelet（根据实际安装路径调整）
sudo rm -f /usr/local/bin/kubelet
# 删除配置文件（如 kubeconfig、启动参数文件等）
sudo rm -rf /etc/kubernetes/kubelet.conf
sudo rm -rf /var/lib/kubelet/  # 工作目录
```
