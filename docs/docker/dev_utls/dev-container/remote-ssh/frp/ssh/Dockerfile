FROM debian:trixie-slim

WORKDIR /app

# 安装必要的软件包
RUN apt-get update && \
    apt-get install -y openssh-server openssh-client curl wget locales gettext tini && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 生成并配置 locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen && \
    update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

# 设置环境变量
ENV LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 LANGUAGE=en_US.UTF-8

# 创建初始化脚本
RUN tee /entrypoint.sh <<-'EOF'
#!/bin/sh

# 确保目录存在
[ ! -d "/var/run/sshd" ] && mkdir -p /var/run/sshd
# 启动 SSH（后台运行）
/usr/sbin/sshd -D &

# 通过 FRPS 进行内网穿透(默认穿透ssh服务)
if [ -n "${serverAddr}" ]; then
    ssh -o StrictHostKeyChecking=no -R :22:${localIP:-127.0.0.1}:${localPort:-22} v0@${serverAddr} -p ${frps_ssh_listen_port:-22} ${proxy_type:-tcp} --proxy_name ${proxy_name} --remote_port ${remotePort} --token ${frp_token:-}
else
    echo "serverAddr 未设置，忽略 SSH 命令。"
fi

# 保持容器运行
wait
EOF

RUN chmod +x /entrypoint.sh

# 暴露 SSH 端口
EXPOSE 22

# 使用 tini 作为 PID 1
ENTRYPOINT ["/usr/bin/tini", "--", "/entrypoint.sh"]
