# 使用官方 CentOS 基础镜像(PS: latest版拉取openssh-server依赖报错)
# FROM rockylinux:latest
# FROM rockylinux:9.3
FROM ubuntu:noble
# FROM almalinux:10-kitten-minimal
# FROM almalinux:10-kitten
# FROM registry.cn-hangzhou.aliyuncs.com/iuin/rockylinux:latest

# ENV https_proxy=http://192.168.0.121:7890 http_proxy=http://192.168.0.121:7890 all_proxy=socks5://192.168.0.121:7890

# RUN sed -i s/mirror.centos.org/vault.centos.org/g /etc/yum.repos.d/*.repo && \
#     sed -i s/^#.*baseurl=http/baseurl=http/g /etc/yum.repos.d/*.repo && \
#     sed -i s/^mirrorlist=http/#mirrorlist=http/g /etc/yum.repos.d/*.repo && \
#     yum install -y wget && \
#     wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo

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
    sed -i 's/#PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config


# RUN wget -O ./frp_0.62.1_linux_amd64.tar.gz https://github.com/fatedier/frp/releases/download/v0.62.1/frp_0.62.1_linux_amd64.tar.gz && \
#     mkdir -p /www/frp && \
#     tar -xzf ./frp_0.62.1_linux_amd64.tar.gz && \
#     mv frp_0.62.1_linux_amd64 frp

COPY ./frp_0.62.1_linux_amd64.tar.gz ./frp_0.62.1_linux_amd64.tar.gz
RUN tar -xzf ./frp_0.62.1_linux_amd64.tar.gz && \
    mv frp_0.62.1_linux_amd64 frp

# 创建包装服务
RUN tee /www/frp/frpc.toml <<-'EOF'
serverAddr = ${serverAddr}
serverPort = ${serverPort}

[[proxies]]
name = ${client_name}
type = "tcp"
localIP = "127.0.0.1"
localPort = 22
remotePort = ${ssh_remotePort}
EOF


# 创建包装服务
RUN tee /etc/systemd/system/frpc.service <<-'EOF'
[Unit]
# 名称，可自定义
Description = frp client
After = network.target syslog.target
Wants = network.target

[Service]
Type = simple
# 启动frpc的命令，需修改为您的frpc的安装路径
ExecStart = /www/frp/frpc -c /www/frp/frpc.toml

[Install]
WantedBy = multi-user.target
EOF

# 启用包装服务
RUN systemctl enable frpc.service


# 暴露 SSH 端口
EXPOSE 22
# 启动ssh和cpolar服务
# ENTRYPOINT [ "/usr/sbin/init" ]


# 创建初始化脚本
RUN tee /usr/local/bin/init-container.sh <<-'EOF'
#!/bin/bash
# 替换环境变量的值
sed -i "s/\${serverAddr}/${serverAddr}/g" /www/frp/frpc.toml
sed -i "s/\${serverPort}/${serverPort}/g" /www/frp/frpc.toml
sed -i "s/\${client_name}/${client_name}/g" /www/frp/frpc.toml
sed -i "s/\${ssh_remotePort}/${ssh_remotePort}/g" /www/frp/frpc.toml
# 启动 init
exec /usr/sbin/init
EOF

RUN chmod +x /usr/local/bin/init-container.sh

# 使用初始化脚本作为入口点
ENTRYPOINT ["/usr/local/bin/init-container.sh"]
