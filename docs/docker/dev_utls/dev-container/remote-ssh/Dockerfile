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

# 设置 root 密码
RUN echo "root:password" | chpasswd

# 修改 SSH 配置文件允许密码登录和 root 登录
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/g' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config

RUN /usr/sbin/sshd-keygen

RUN curl -L https://www.cpolar.com/static/downloads/install-release-cpolar.sh | bash

COPY cpolar.yml /usr/local/etc/cpolar/cpolar.yml

# 开启服务后, /usr/sbin/init命令会自动帮忙启动服务
RUN systemctl enable cpolar.service

# 暴露 SSH 端口
EXPOSE 22
# 启动ssh和cpolar服务
ENTRYPOINT [ "/usr/sbin/init" ]
