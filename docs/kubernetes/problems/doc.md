# 问题

## 证书问题

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
