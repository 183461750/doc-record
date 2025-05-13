
FROM ubuntu:noble

WORKDIR /www

# 安装必要的软件包
RUN apt-get update && \
    apt-get install -y openssh-server openssh-client curl wget locales gettext tini && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 生成 en_US.UTF-8 locale
RUN locale-gen en_US.UTF-8

# 设置环境变量
ENV LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 LANGUAGE=en_US.UTF-8

# 解压frp
COPY ./frp_0.62.1_linux_amd64.tar.gz ./frp_0.62.1_linux_amd64.tar.gz
RUN tar -xzf ./frp_0.62.1_linux_amd64.tar.gz && \
    mv frp_0.62.1_linux_amd64 frp

# 创建包装服务
RUN tee /www/frp/frpc.toml <<-'EOF'
serverAddr = ${serverAddr}
serverPort = ${serverPort}

[[${client_title}]]
name = ${client_name}
type = ${client_type}
${secretKey_stcp_line}
${localIP_proxies_line}
${localPort_proxies_line}
${serverName_visitors_line}
${bindAddr_visitors_line}
${bindPort_visitors_line}
${remotePort_proxies_tcp_line}
EOF

# 创建初始化脚本
RUN tee /entrypoint.sh <<-'EOF'
#!/bin/sh
# 替换环境变量的值
envsubst < /www/frp/frpc.toml > /tmp/frpc.toml.tmp && mv /tmp/frpc.toml.tmp /www/frp/frpc.toml

# 确保目录存在
mkdir /var/run/sshd
# 启动 SSH（后台运行）
/usr/sbin/sshd -D &

# 启动 FRPC
/www/frp/frpc -c /www/frp/frpc.toml

# 保持容器运行
wait
EOF

RUN chmod +x /entrypoint.sh

# 暴露 SSH 端口
EXPOSE 22

# 使用 tini 作为 PID 1
ENTRYPOINT ["/usr/bin/tini", "--", "/entrypoint.sh"]
