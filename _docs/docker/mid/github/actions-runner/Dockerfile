# 使用官方 CentOS 基础镜像(PS: latest版拉取openssh-server依赖报错)
# FROM centos:centos7.9.2009
FROM registry.cn-hangzhou.aliyuncs.com/iuin/centos:latest

WORKDIR /data

# ENV https_proxy=http://192.168.0.121:7890 http_proxy=http://192.168.0.121:7890 all_proxy=socks5://192.168.0.121:7890

RUN sed -i s/mirror.centos.org/vault.centos.org/g /etc/yum.repos.d/*.repo && \
    sed -i s/^#.*baseurl=http/baseurl=http/g /etc/yum.repos.d/*.repo && \
    sed -i s/^mirrorlist=http/#mirrorlist=http/g /etc/yum.repos.d/*.repo && \
    yum install -y wget && \
    # 修改镜像源为阿里源
    cp /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak && \
    wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo && \
    # 安装docker
    yum install -y yum-utils && \
    yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo && \
    yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin && \
    systemctl enable docker

# 安装必要的软件包
RUN yum update -y && yum install -y openssh-server openssh-clients passwd && yum clean all

# 设置 root 密码, 修改 SSH 配置文件允许密码登录和 root 登录, 并生成 公私钥
RUN echo "root:password" | chpasswd && sed -i 's/#PermitRootLogin .*/PermitRootLogin yes/g' /etc/ssh/sshd_config && /usr/sbin/sshd-keygen

RUN useradd www

# 调整ssh配置
RUN sed -i 's/GSSAPIAuthentication yes/GSSAPIAuthentication no/g' /etc/ssh/sshd_config && \
    sed -i 's/#UseDNS yes/UseDNS no/g' /etc/ssh/sshd_config && \
    sed -i 's/#PermitTunnel no/PermitTunnel yes/g' /etc/ssh/sshd_config

# GitHub pages actions-runner
RUN mkdir actions-runner && cd actions-runner && \
    curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/download/v2.320.0/actions-runner-linux-x64-2.320.0.tar.gz && \
    tar xzf ./actions-runner.tar.gz

# 禁用 SELinux, 否则ssh没权限远程连接
RUN sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config

# 暴露 SSH 端口
EXPOSE 22

ENTRYPOINT [ "/usr/sbin/init" ]
