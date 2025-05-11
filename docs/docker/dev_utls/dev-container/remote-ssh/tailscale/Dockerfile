FROM ubuntu:noble

WORKDIR /www

# 安装必要的软件包
RUN apt-get update && \
    apt-get install -y openssh-server openssh-client passwd curl wget gettext && \
    # 安装tailscale
    curl -fsSL https://tailscale.com/install.sh | sh && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 配置 SSH（可选）
RUN mkdir /var/run/sshd && \
    echo 'root:password' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config


# 创建启动脚本
RUN tee /usr/local/bin/start-tailscale.sh <<-'EOF'
#!/bin/bash
tailscale up --accept-dns=true --accept-routes --login-server=${login_server} --hostname=${hostname} --force-reauth  --authkey ${authkey}
EOF

# 创建包装服务
RUN tee /etc/systemd/system/tailscale.service <<-'EOF'
[Unit]
# 名称，可自定义
Description = tailscale
After = network.target syslog.target
Wants = network.target

[Service]
Type = simple
# 启动tailscale的命令，需修改为您的tailscale的安装路径
ExecStart=/usr/local/bin/start-tailscale.sh

[Install]
WantedBy = multi-user.target
EOF

# 启用包装服务
RUN systemctl enable tailscale.service


# 暴露 SSH 端口
EXPOSE 22
# 启动ssh和cpolar服务
# ENTRYPOINT [ "/usr/sbin/init" ]


# 创建初始化脚本
RUN tee /usr/local/bin/init-container.sh <<-'EOF'
#!/bin/bash
# 替换环境变量的值
envsubst < /usr/local/bin/start-tailscale.sh > /tmp/start-tailscale.tmp && \
    mv /tmp/start-tailscale.tmp /usr/local/bin/start-tailscale.sh && \
    chmod +x /usr/local/bin/start-tailscale.sh

# 启动 init
exec /usr/sbin/init
EOF

RUN chmod +x /usr/local/bin/init-container.sh

# 使用初始化脚本作为入口点
ENTRYPOINT ["/usr/local/bin/init-container.sh"]
