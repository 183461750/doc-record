FROM ubuntu:noble

WORKDIR /www

# 安装必要的软件包
RUN apt-get update && \
    apt-get install -y openssh-server openssh-client curl wget gettext tini && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY ./frp_0.62.1_linux_amd64.tar.gz ./frp_0.62.1_linux_amd64.tar.gz
RUN tar -xzf ./frp_0.62.1_linux_amd64.tar.gz && \
    mv frp_0.62.1_linux_amd64 frp

# 创建包装服务
RUN tee /www/frp/frps.toml <<-'EOF'
bindPort = 7000

sshTunnelGateway.bindPort = 2222
# sshTunnelGateway.privateKeyFile = ""
# sshTunnelGateway.autoGenPrivateKeyPath = ""
# sshTunnelGateway.authorizedKeysFile = "~/.ssh/authorized_keys"

# auth.token = "xxx"
${auth_token_line}
EOF


# 创建初始化脚本
RUN tee /entrypoint.sh <<-'EOF'
#!/bin/sh
# 替换环境变量的值
envsubst < /www/frp/frps.toml > /tmp/frps.toml.tmp && mv /tmp/frps.toml.tmp /www/frp/frps.toml

# 确保目录存在
[ ! -d "/var/run/sshd" ] && mkdir -p /var/run/sshd
# 启动 SSH（后台运行）
/usr/sbin/sshd

# 启动 FRPC
/www/frp/frps -c /www/frp/frps.toml

# 保持容器运行
tail -f /dev/null
EOF

RUN chmod +x /entrypoint.sh

# 暴露 SSH 端口
EXPOSE 7000

# 使用 tini 作为 PID 1
ENTRYPOINT ["/usr/bin/tini", "--", "/entrypoint.sh"]
