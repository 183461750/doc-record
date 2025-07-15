FROM ubuntu:noble

WORKDIR /www

# 安装必要的软件包
RUN apt-get update && \
    apt-get install -y openssh-server openssh-client curl wget net-tools locales gettext tini && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 生成 en_US.UTF-8 locale
RUN locale-gen en_US.UTF-8
# 设置环境变量
ENV LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 LANGUAGE=en_US.UTF-8

# 解压jumpbox
COPY ./jumpboxc ./jumpbox/
RUN chmod +x /www/jumpbox/jumpboxc

# 创建包装服务
RUN tee /www/jumpbox/jumpboxc.toml <<-'EOF'
serverAddr = ${serverAddr}
serverPort = ${serverPort}
${auth_token_line}

[[${client_title}]]
name = ${client_name}
type = ${client_type}
${secretKey_stcp_line}
${localIP_proxies_line}
${localPort_proxies_line}
${serverName_visitors_line}
${bindAddr_visitors_line}
${bindPort_visitors_line}
${keepTunnelOpen_visitors_line}
${remotePort_proxies_tcp_line}
EOF

# 创建初始化脚本
RUN tee /entrypoint.sh <<-'EOF'
#!/bin/sh
# 替换环境变量的值
envsubst < /www/jumpbox/jumpboxc.toml > /tmp/jumpboxc.toml.tmp && mv /tmp/jumpboxc.toml.tmp /www/jumpbox/jumpboxc.toml

# 确保目录存在
[ ! -d "/var/run/sshd" ] && mkdir -p /var/run/sshd
# 启动 SSH（后台运行）
/usr/sbin/sshd

# 生成ssh公私钥
ssh-keygen -t ed25519 -C "jumpbox" -f ~/.ssh/id_ed25519_jumpbox -N ""

# 设置authorized_keys
cat ~/.ssh/id_ed25519_jumpbox.pub > ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 启动 jumpboxC
/www/jumpbox/jumpboxc -c ${jumpboxc_config_path:-/www/jumpbox/jumpboxc.toml}

# 保持容器运行
tail -f /dev/null
EOF

RUN chmod +x /entrypoint.sh

# 暴露 SSH 端口
EXPOSE 22

# 使用 tini 作为 PID 1
ENTRYPOINT ["/usr/bin/tini", "--", "/entrypoint.sh"]
