FROM ubuntu:noble

WORKDIR /www

# 安装必要的软件包
RUN apt-get update && \
    apt-get install -y openssh-server openssh-client passwd curl wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 配置 SSH（可选）
RUN mkdir /var/run/sshd && \
    echo 'root:password' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config

# RUN wget -O ./frp_0.62.1_linux_amd64.tar.gz https://github.com/fatedier/frp/releases/download/v0.62.1/frp_0.62.1_linux_amd64.tar.gz && \
#     mkdir -p /www/frp && \
#     tar -xzf ./frp_0.62.1_linux_amd64.tar.gz && \
#     mv frp_0.62.1_linux_amd64 frp

COPY ./frp_0.62.1_linux_amd64.tar.gz ./frp_0.62.1_linux_amd64.tar.gz
RUN tar -xzf ./frp_0.62.1_linux_amd64.tar.gz && \
    mv frp_0.62.1_linux_amd64 frp

# 创建包装服务
RUN tee /www/frp/frps.toml <<-'EOF'
bindPort = ${bindPort}

sshTunnelGateway.bindPort = 22
# sshTunnelGateway.privateKeyFile = ""
# sshTunnelGateway.autoGenPrivateKeyPath = ""
# sshTunnelGateway.authorizedKeysFile = "~/.ssh/authorized_keys"

auth.token = "xxx"
EOF


# 创建包装服务
RUN tee /etc/systemd/system/frps.service <<-'EOF'
[Unit]
# 名称，可自定义
Description = frp server
After = network.target syslog.target
Wants = network.target

[Service]
Type = simple
# 启动frps的命令，需修改为您的frps的安装路径
ExecStart = /www/frp/frps -c /www/frp/frps.toml

[Install]
WantedBy = multi-user.target
EOF

# 启用包装服务
RUN systemctl enable frps.service


# 暴露 SSH 端口
EXPOSE 22 2222
# 启动ssh和cpolar服务
# ENTRYPOINT [ "/usr/sbin/init" ]


# 创建初始化脚本
RUN tee /usr/local/bin/init-container.sh <<-'EOF'
#!/bin/bash
# 替换环境变量的值
sed -i "s/\${bindPort}/${bindPort}/g" /www/frp/frps.toml
# 启动 init
exec /usr/sbin/init
EOF

RUN chmod +x /usr/local/bin/init-container.sh

# 使用初始化脚本作为入口点
ENTRYPOINT ["/usr/local/bin/init-container.sh"]
