# 使用官方 CentOS 基础镜像(PS: latest版拉取openssh-server依赖报错)
# FROM centos:centos7.9.2009
FROM registry.cn-hangzhou.aliyuncs.com/iuin/centos:latest

# ENV https_proxy=http://192.168.0.121:7890 http_proxy=http://192.168.0.121:7890 all_proxy=socks5://192.168.0.121:7890

RUN sed -i s/mirror.centos.org/vault.centos.org/g /etc/yum.repos.d/*.repo && \
    sed -i s/^#.*baseurl=http/baseurl=http/g /etc/yum.repos.d/*.repo && \
    sed -i s/^mirrorlist=http/#mirrorlist=http/g /etc/yum.repos.d/*.repo && \
    yum install -y wget && \
    wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo

# 安装必要的软件包
RUN yum update -y && yum install -y openssh-server openssh-clients passwd && yum clean all

# 设置 root 密码, 修改 SSH 配置文件允许密码登录和 root 登录
RUN echo "root:password" | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/g' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config && \
    /usr/sbin/sshd-keygen

RUN curl -L https://www.cpolar.com/static/downloads/install-release-cpolar.sh | bash

COPY cpolar.yml /usr/local/etc/cpolar/cpolar.yml

# 开启服务后, /usr/sbin/init命令会自动帮忙启动服务
RUN systemctl enable cpolar.service


# 创建启动脚本
RUN tee /usr/local/bin/start-cpolar.sh <<-'EOF'
#!/bin/bash
cpolar authtoken ${CPOLAR_AUTH_TOKEN}
EOF

RUN chmod +x /usr/local/bin/start-cpolar.sh

# 创建包装服务
RUN tee /etc/systemd/system/cpolar-wrapper.service <<-'EOF'
[Unit]
Description=Cpolar Wrapper Service
# After=network.target
After=cpolar.service

[Service]
Type=simple
ExecStart=/usr/local/bin/start-cpolar.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 启用包装服务
RUN systemctl enable cpolar-wrapper.service


# 暴露 SSH 端口
EXPOSE 22
# 启动ssh和cpolar服务
# ENTRYPOINT [ "/usr/sbin/init" ]


# 创建初始化脚本
RUN tee /usr/local/bin/init-container.sh <<-'EOF'
#!/bin/bash
# 替换环境变量的值
sed -i "s/\${CPOLAR_AUTH_TOKEN}/$CPOLAR_AUTH_TOKEN/g" /usr/local/bin/start-cpolar.sh
sed -i "s/\${CPOLAR_CONTANER_SSH_NAME}/${CPOLAR_CONTANER_SSH_NAME:-contaner_ssh}/g" /usr/local/etc/cpolar/cpolar.yml
# 启动 init
exec /usr/sbin/init
EOF

RUN chmod +x /usr/local/bin/init-container.sh

# 使用初始化脚本作为入口点
ENTRYPOINT ["/usr/local/bin/init-container.sh"]
