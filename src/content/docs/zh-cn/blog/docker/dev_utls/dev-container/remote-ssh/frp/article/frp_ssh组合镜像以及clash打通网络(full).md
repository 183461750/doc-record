---
title: "(frps selfhost版)有没想过起个容器就能打通整个内网呢? 使用容器打通受限网络: frp+ssh组合镜像以及clash(mihomo)实现打通网络(full)"
date: 2025-05-20
---
<!-- truncate -->

> 使用容器打通受限网络: frp+ssh组合镜像以及clash(mihomo)实现打通任意环境所有内网服务(包括k8s)(web页面以及终端访问)
> 这里还有个需要提到的是, 因为我的科学上网环境是用的clash(mihomo)软件, 所以这里就用clash(mihomo)来实现打通各种内网
> 这样我就可以只需要一个代理软件就行了

<!-- truncate -->

## 前言

开发过程中总是能遇到需要访问其他公司内网的情况, 一般常规方案都是由其他公司提供vpn访问, 或者jumpserver进行内网服务器连接.

这时, 一般就会遇到几个痛点:
    - 想要访问k8s中的容器服务, k8s内部域名`svc.cluster.local`无法直接使用
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

随便找台Linux系统, 或者自己电脑也行(就是麻烦点, 可能构建镜像时, 需要指定构建平台等), 我这里选择用x86架构的centos系统, 然后, 找个合适的目录, 例如: `/www/container/frp-ssh`

- 创建`Dockerfile`文件

```bash
# vim Dockerfile

FROM debian:trixie-slim

WORKDIR /www

# 安装必要的软件包
RUN apt-get update && \
    apt-get install -y openssh-server openssh-client curl wget locales gettext tini && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 生成并配置 locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && \
    locale-gen && \
    update-locale LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

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
[ ! -d "/var/run/sshd" ] && mkdir -p /var/run/sshd
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

```

## 第二步: 编写docker-compose.yml, 方便构建和运行容器

```bash
# vim docker-compose.yml

services:
  dev-jumpbox:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: dev-jumpbox
    environment:
      TZ: "Asia/Shanghai"
      # 配置服务端的IP
      serverAddr: '"129.204.8.8"'
      client_title: proxies
      serverPort: 7000
      # 名称随便给, 不重复就行
      client_name: '"dev-jumpbox-6666"'
      client_type: '"tcp"'
      localIP_proxies_line: localIP="127.0.0.1"
      localPort_proxies_line: localPort=22
      # 配置云服务器中开放的端口, 随便开放一个都行, 用于远程连接ssh
      remotePort_proxies_tcp_line: remotePort=6666
    extra_hosts:
      - "me.host:host-gateway"
    restart: unless-stopped
    volumes:
      - ./.ssh/authorized_keys:/root/.ssh/authorized_keys

# 以上环境变量, 除了备注的内容, 其他的都可以保持不动就行

# authorized_keys的内容示例
# ssh-ed25519 xxxxx xxx
```

- authorized_keys的内容示例

```bash
# 在本地电脑中执行, 打印公钥
cat ~/.ssh/id_ed25519.pub
# 复制打印的公钥内容, 需要写入到`./.ssh/authorized_keys`, 这个文件是需要挂载到容器中的文件
```

- 关于卷(volumes)的说明

这里的卷也可以不挂载, 也可以通过进入容器中执行命令去写入`authorized_keys`文件中

```bash
# 使用挂载券方式时, 这一步可省略
echo 'ssh-ed25519 xxxxx xxx' > /root/.ssh/authorized_keys

```

## 第三步: 需要一台有公网IP的云服务器(2c2g1m就差不多了, 我的镜像是Debian)

[frp官网安装地址](https://gofrp.org/zh-cn/docs/setup/systemd/)
[frp官方GitHub下载地址](https://github.com/fatedier/frp/releases/tag/v0.62.1)

```bash
# 下载下来解压
tar -xzf ./frp_0.62.1_linux_amd64.tar.gz && mv frp_0.62.1_linux_amd64 frp
# 进入解压后的目录, 启动frp服务端, 设置开机自启
cd frp && systemctl start frps && systemctl enable frps
```

然后, 开放下端口, 例如: 开放端口:6666, 用于远程连接ssh

## 第四步: 启动docker-compose, 测试容器以及上传进行

```bash
# 构建镜像并启动容器
docker-compose up -d
```

- 使用ssh远程连接下, 试试效果

```bash
# 上传公钥, 开启免密登录, 这一步也是顺便检查了是否能够正常通过内网穿透ssh到容器中
ssh-copy-id root@129.204.8.8 -p 6666 -i ~/.ssh/id_ed25519
# 然后, 通过ssh免密登录
ssh root@129.204.8.8 -p 6666
```

> 到这就已经基本完成了在任何地方都能联通ssh了, 接下来的就是简化配置, 以及高级应用了

## 上传镜像到阿里云, 简化启动容器的配置

```bash
# 登录
docker login --username=xxx@qq.com registry.cn-hangzhou.aliyuncs.com
## 标记本地镜像并指向目标仓库（ip:port/image_name:tag，该格式为标记版本号）
docker tag dev-jumpbox registry.cn-hangzhou.aliyuncs.com/xxx/dev-jumpbox:frpc-ssh
## 推送镜像到仓库
docker push registry.cn-hangzhou.aliyuncs.com/xxx/dev-jumpbox:frpc-ssh
```

## 简化后的docker-compose配置

简化后, 就只需要docker-compose配置即可, 当然, 如果没有将`authorized_keys`配置整合到Dockerfile中的情况下, 还是需要挂载配置的

[参考详情链接](https://iuin8.github.io/doc-record/docker/dev_utls/dev-container/remote-ssh/frp/tcpmux/v6.1.1/doc)

```bash

services:
  dev-jumpbox:
    image: registry.cn-hangzhou.aliyuncs.com/iuin/dev-jumpbox:tcpmux-v6.1.1
    container_name: dev-jumpbox
    environment:
      TZ: "Asia/Shanghai"
      serverAddr: '"183.11.11.11"'
      serverPort: 11100
      auth_token: '"xx-jumpbox-ssh"'
      client_name: '"container.prod.xxx.customer"'
      customDomains: '["container.prod.xxx.customer"]'
    restart: unless-stopped

```

## 配合clash(mihomo)工具使用, 方便访问网页

这里, 我们借助clash(mihomo)工具, 通过ssh将流量代理转发到容器中, 实现像访问局域网一样访问容器那边的对应内网上的网页

- [clash(mihomo)的github地址](https://www.clashverge.dev/guide/quickstart.html)

```bash
# 代理流量(script.js[这里用了全局脚本的方式, 兼容自己的原有的订阅, 不影响原有的订阅, 只做扩展])
function main(config, profileName) {
  const extra = {
    proxies: [
      {
        name: "company_container",
        type: "ssh",
        server: "183.11.11.11",
        port: 11111,
        username: "root",
        "private-key": "./.ssh/id_ed25519_iu"
      }
    ],
    proxyGroups: [
      {
        name: "company_g",
        type: "select",
        proxies: ["DIRECT", "company_container"]
      }
    ],
    rules: [
      "IP-CIDR,10.0.11.0/24,company_g",
      "DOMAIN-SUFFIX,company.com,company_g"
    ]
  };

  if (!Array.isArray(config.proxies)) config.proxies = [];
  for (const p of extra.proxies) {
    if (p && p.name && !config.proxies.some(x => x && x.name === p.name)) {
      config.proxies.unshift(p);
    }
  }

  if (!Array.isArray(config["proxy-groups"])) config["proxy-groups"] = [];
  for (const g of extra.proxyGroups) {
    let existing = config["proxy-groups"].find(x => x && x.name === g.name);
    if (!existing) {
      config["proxy-groups"].unshift({ name: g.name, type: g.type, proxies: Array.isArray(g.proxies) ? [...g.proxies] : [] });
    } else {
      if (!Array.isArray(existing.proxies)) existing.proxies = [];
      for (const pn of g.proxies || []) {
        if (!existing.proxies.includes(pn)) existing.proxies.unshift(pn);
      }
    }
  }

  if (!Array.isArray(config.rules)) config.rules = [];
  for (const r of extra.rules) {
    if (!config.rules.includes(r)) config.rules.unshift(r);
  }

  return config;
}

```

```yml
# 单独订阅配置(ssh.yml)
proxies:
  - name: company_container
    type: ssh
    server: 183.11.11.11
    port: 11111
    username: root
    private-key: ./.ssh/id_ed25519_iu

proxy-groups:
  - name: company_g
    type: select
    proxies:
      - company_container

rules:
  - "IP-CIDR,10.0.11.0/24,company_g"
  - "DOMAIN-SUFFIX,company.com,company_g"

```

## k8s中使用, 打通命名空间中的网络

```yml
## k8s等(有内部DNS功能的系统)用法

# 其他配置省略
rules:
  - "IP-CIDR,10.0.11.0/24,company_g"
  - "IP-CIDR,100.20.0.0/16,company_g"
  - "IP-CIDR,100.19.0.0/16,company_g"
  - "DOMAIN-SUFFIX,svc.cluster.local,company_g"
  - "DOMAIN-SUFFIX,company.com,company_g"

```

- 说明: 这里挂载了三个网段
  - 其中, 第一个网段是需要代理其他正常流量的网段
  - 第二和第三个网段, 则是命名空间中的容器使用的网段
    - 作用是, 让我们能通过k8s内部域名访问, k8s中容器提供的服务
      - 即通过`svc.cluster.local`k8s中内部域名访问

## 最后的话

到这就基本完成了我们的目标了, 能够正常像在一个局域网中一样, 访问网页以及连接数据库等了

- 更多内容
  - [这篇文章对应的GitHub博客文档地址](https://iuin8.github.io/doc-record/docs/docker/dev_utls/dev-container/remote-ssh/frp/article/frp+ssh组合镜像以及clash打通网络.md)
