# (免费版)有没想过起个容器就能打通整个内网呢? 使用容器打通受限网络: cpolar+ssh组合镜像以及sshuttle打通网络

> 使用容器打通受限网络: cpolar+ssh组合镜像以及sshuttle实现打通任意环境所有内网服务(包括k8s)(web页面以及终端访问)

## 前言

开发过程中总是能遇到需要访问其他公司内网的情况, 一般常规方案都是由其他公司提供vpn访问, 或者jumpserver进行内网服务器连接.

这时, 一般就会遇到几个痛点:
    - 想要访问k8s中的容器服务, k8s内部域名无法直接使用
    - 要装很多乱七八糟的vpn软件, 不同公司用的vpn可能就不一样, 有的vpn甚至像流氓软件一样, 有各种限制
    - 有的公司不提供vpn或jumpserver, 只能去现场
    - 家里网络和公司网络不互通的问题(在公司想访问家里的一些服务, 或在家想访问公司的一些服务等)

然而, 打通网络后, 都有哪些好处呢?
    - 自己本地电脑不在需要安转太多的vpn软件了
    - 所能触碰到的每台内网服务器, 都能成为你在何时何地都能访问或当做跳板机的工具
    - 内网才能打开的页面, 随时都能打开了
      - 网页系统应用能用浏览器打开了
      - nacos能用浏览器打开了
    - 内网才能访问的服务器, 随时都能访问了
      - 数据库能通过idea或者DBeaver可视化连接了

> 也就是说, 打通了网络, 也就打通了ssh访问, ssh能到达的地方, 都能将自己的本地电脑拉入到同一网络中进行互通操作

## 前提

需要有机会把容器起起来, 一般有以下几种方式, 选一个方便去操作的就行, 当容器起来之后, 网络就打通了, 虚拟机等过渡工具就可以删掉了, 不需要了
    - 通过jumpserver页面登录
    - 自己本身就安转了vpn
    - 找安装了vpn的同事
    - 专门找台机用于安装各种乱七八糟的vpn也行
    - 当然起个虚拟机去安转也行

## 第一步: 编写Dockerfile, 用于制作镜像

随便找台Linux系统, 或者自己电脑也行(就是麻烦点, 可能构建镜像时, 需要指定构建平台等), 我这里选择用x86架构的centos系统, 然后, 找个合适的目录, 例如: `/www/container/cpolar-ssh`

- 创建`Dockerfile`文件

```bash
# vim Dockerfile
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

```

## 第二步: 编写docker-compose.yml, 方便构建和运行容器

```bash
vim docker-compose.yml

services:
  cpolar-ssh:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - TZ="Asia/Shanghai"
      - CPOLAR_AUTH_TOKEN=xxx
      - CPOLAR_CONTANER_SSH_NAME=contaner_ssh_1
    restart: unless-stopped
    privileged: true 
    volumes:
      - ./cpolar.yml:/usr/local/etc/cpolar/cpolar.yml

```

- 编写用于挂载的cpolar配置文件
  - 这个也可以考虑写死到Dockerfile中, 通过环境变量的方式去更新变量
  - 需要配置更多的隧道, 再把它给挂载出来, 这样能够简化下基础流程

```bash
vim cpolar.yml

tunnels:
  ${CPOLAR_CONTANER_SSH_NAME}:
    proto: tcp
    addr: "22"
    bind_tls: both
    start_type: enable

```

## 第三步: 启动docker-compose, 测试容器以及上传进行

调整上一步中的环境变量, 主要是`CPOLAR_AUTH_TOKEN`, 需要到cpolar中注册个免费账号, 才能获取到token

- [cpolar官网地址](https://www.cpolar.com/)

```bash
# 构建镜像并启动容器
docker-compose up -d
```

- 使用ssh远程连接下, 试试效果

```bash
# vim ~/.ssh/config
Host cpolar.internet.company
  HostName xxx.tcp.cpolar.top
  User root
  Port 11111
  IdentityFile ~/.ssh/id_ed25519
```

```bash
# 上传公钥, 开启免密登录, 这一步也是顺便检查了是否能够正常通过内网穿透ssh到容器中
ssh-copy-id cpolar.internet.company -i ~/.ssh/id_ed25519
# 然后, 通过ssh免密登录
ssh cpolar.internet.company
```

> 到这就已经基本完成了在任何地方都能联通ssh了, 接下来的就是简化配置, 以及高级应用了

## 上传镜像到阿里云, 简化启动容器的配置

```bash
# 登录
docker login --username=xxx@qq.com registry.cn-hangzhou.aliyuncs.com
## 标记本地镜像并指向目标仓库（ip:port/image_name:tag，该格式为标记版本号）
docker tag cpolar-ssh registry.cn-hangzhou.aliyuncs.com/xxx/cpolar-ssh:latest
## 推送镜像到仓库
docker push registry.cn-hangzhou.aliyuncs.com/xxx/cpolar-ssh:latest
```

## 简化后的docker-compose配置

简化后, 就只需要docker-compose配置即可, 当然, 如果没有将cpolar配置整合到Dockerfile中的情况下, 还是需要挂载配置的

```bash
services:
  cpolar-ssh:
    image: registry.cn-hangzhou.aliyuncs.com/xxx/cpolar-ssh:latest
    environment:
      - TZ="Asia/Shanghai"
      - CPOLAR_AUTH_TOKEN=${CPOLAR_AUTH_TOKEN}
      - CPOLAR_CONTANER_SSH_NAME=contaner_ssh_1
    restart: unless-stopped
    privileged: true 
```

## 配合sshuttle工具使用, 方便访问网页

这里, 我们借助sshuttle工具, 通过ssh将流量代理转发到容器中, 实现想访问局域网一样访问容器那边的对应内网上的网页

- [sshuttle的github地址](https://github.com/sshuttle/sshuttle)

```bash
# 安装(macos)
brew install sshuttle
# 代理流量
sshuttle --sudoers-user fa --dns --method auto --auto-hosts --auto-nets -D -r cpolar.internet.company 10.0.10.0/24
```

## 最后的话

到这就基本完成了我们最初的目标了, 能够正常像在一个局域网中一样, 访问网页以及连接数据库等了

- 最后说下现有方案还存在的一些问题
  - 密码连接相对没那么安全
  - 使用到了`systemd`工具, 也就是docker-compose中必须使用`privileged: true`, 容器权限太高了
  - 用的第三方的服务器(cpolar)做中转, 流量要经过别人的服务器

- 下期目标
  - ssh改为使用密钥方式登录, 禁用密码登录
  - 容器服务管理工具不使用`systemd`, 而是改为更轻量的多服务管理工具`tini`
    - 这样docker容器也不在需要配置`privileged: true`了
  - 内网穿透改为开源的`frp`, 当然, 这里就需要自己有一台公网的服务器去部署服务端了

- 相关链接
  - [这篇文章对应的博客文档](https://183461750.github.io/doc-record/docker/dev_utls/dev-container/remote-ssh/cpolar/article/doc)
  - [对应的GitHub仓库](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/dev-container/remote-ssh/cpolar/v3/simple/docker-compose.yml), 可以在这里找到相关的全部配置代码

> 想不到这么快就到说再见的时候了, 稍稍的期待一下吧, 下期再见👋
