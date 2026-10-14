---
title: "(frps selfhost版)有没想过起个容器就能打通整个内网呢? 使用容器打通受限网络: frp+ssh组合镜像以及clash(mihomo)实现打通网络"
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

## 编写docker-compose.yml(服务端)

> 这里的服务端, 就是你有公网IP的云服务器, 我这里用的是Debian, 你可以根据自己的情况, 选择合适的镜像

```yml
# vi /www/dev-jumpbox/server/docker-compose.yml
services:
  frps-ssh:
    image: registry.cn-hangzhou.aliyuncs.com/iuin/frps-ssh:tcpmux
    network_mode: host
    environment:
      - TZ="Asia/Shanghai"
      - auth_token="xxx"
      - bindPort=18000
      - tcpmuxHTTPConnectPort=12222
    restart: unless-stopped

```

```bash
# 构建镜像并启动容器
docker-compose up -d
```

## 编写docker-compose.yml(客户端)

共用端口的方式, [参考文章](https://gofrp.org/zh-cn/docs/examples/multiple-ssh-over-same-port/)

PS: 自定义域名需要配合`proxycommand`代理使用`ssh -o 'proxycommand socat - PROXY:x.x.x.x:%h:%p,proxyport=5002' test@machine-a.example.com`

```yml
# vi /www/dev-jumpbox/client/docker-compose.yml
services:
  dev-jumpbox:
    image: registry.cn-hangzhou.aliyuncs.com/iuin/dev-jumpbox:tcpmux-v6.1.1
    container_name: dev-jumpbox
    environment:
      TZ: "Asia/Shanghai"
      serverAddr: '"55.44.33.33"'
      serverPort: 18000
      auth_token: '"jumpboxs-ssh"'
      client_name: '"jumpboxc-ssh-fa"'
      customDomains: '["fa.intranet.company"]'
    volumes:
      # 需要先创建这个文件, 不然会自动创建为文件夹
      - ./.ssh/authorized_keys:/root/.ssh/authorized_keys:ro
    restart: unless-stopped

```

不想要多配置个`proxycommand`的话, 用下面的方式会简单点, 但需要独占端口

```bash

services:
  dev-jumpbox:
    image: registry.cn-hangzhou.aliyuncs.com/iuin/dev-jumpbox:frpc-ssh-v6.1
    container_name: dev-jumpbox
    environment:
      TZ: "Asia/Shanghai"
      serverAddr: '"55.44.33.33"'
      client_title: proxies
      serverPort: 18000
      auth_token_line: auth.token = "jumpboxs-ssh"
      client_name: '"fa.intranet.company"'
      client_type: '"tcp"'
      localIP_proxies_line: localIP="127.0.0.1"
      localPort_proxies_line: localPort=22
      # 独占端口方式, 需要外网防火墙开放这个端口
      remotePort_proxies_tcp_line: remotePort=12202
    extra_hosts:
      - "container.host:host-gateway"
    volumes:
      # 需要先创建这个文件, 不然会自动创建为文件夹
      - ./.ssh/authorized_keys:/root/.ssh/authorized_keys:ro
    restart: unless-stopped

```

```bash
# 构建镜像并启动容器
docker-compose up -d
```

- 关于卷(volumes)的说明

这里的卷也可以不挂载, 也可以通过进入容器中执行命令去写入`authorized_keys`文件中, 不过容器重启后, 会丢失写入的内容

```bash
# 在本地电脑中执行, 打印公钥
cat ~/.ssh/id_ed25519.pub
# 复制打印的公钥内容, 需要写入到`./.ssh/authorized_keys`, 这个文件是需要挂载到容器中的文件
# 全路径: /www/dev-jumpbox/client/.ssh/authorized_keys(注意: 别跟宿主机的authorized_keys文件搞混了)
# 这里也可以由dev-jumpbox容器去管理ssh公私钥, 把宿主机生成好的公私钥, 挂载到容器中, 然后在容器中执行命令去写入authorized_keys文件中, 最后把私钥给到clash(mihomo)工具使用
# 如果clash用户想用自己的私钥的话, 那就在生成私钥的时候, 选择将公私钥生成到clash配置目录下, 然后在clash配置文件中, 引用自己的私钥文件即可(clash verge rev只支持读取根目录下的私钥文件)
```

```bash
# 在客户端宿主机或者容器中执行, 写入公钥到authorized_keys文件中
echo 'ssh-ed25519 xxxxx xxx' > ./.ssh/authorized_keys
```

## 第四步: 启动docker-compose, 测试容器以及上传进行

```bash
# 构建镜像并启动容器
docker-compose up -d
```

- 使用ssh远程连接下, 试试效果

```bash
# 上传公钥, 开启免密登录, 这一步也是顺便检查了是否能够正常通过内网穿透ssh到容器中
ssh-copy-id root@129.204.8.8 -p 12222 -i ~/.ssh/id_ed25519
# 然后, 通过ssh免密登录
ssh root@129.204.8.8 -p 12222
```

[参考详情链接](https://iuin8.github.io/doc-record/docker/dev_utls/dev-container/remote-ssh/frp/tcpmux/v6.1.1/doc)

> 到这就已经基本完成了在任何地方都能联通ssh了, 接下来的就是高级应用了, 配合clash(mihomo)工具, 实现网络流量代理到内容容器中

## 配合clash(mihomo)工具使用, 方便访问网页

这里, 我们借助clash(mihomo)工具, 通过ssh将流量代理转发到容器中, 实现像访问局域网一样访问容器那边的对应内网上的网页

- [clash(mihomo)的github地址](https://www.clashverge.dev/guide/quickstart.html)

```javascript
// 代理流量(script.js[这里用了全局脚本的方式, 兼容自己的原有的订阅, 不影响原有的订阅, 只做扩展])
function main(config, profileName) {
  const privateKeyContent = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZxxxABAAAAMwAAA
QyNTUxOQAAAxxxAAAIgIqewcCKn
HAAAAAtxxxDYC8YhlRDIhM+GUeg
-----END OPENSSH PRIVATE KEY-----`;
  const extra = {
    proxies: [
      {
        name: "company_container",
        type: "ssh",
        server: "183.11.11.11",
        port: 11111,
        username: "root",
        // 用密钥的情况下, 这里需要把密钥复制到软件配置目录下的.ssh目录中, 才能正常使用
        // "private-key": "./.ssh/id_ed25519_iu"
        "private-key": privateKeyContent
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
    # 用密钥的情况下, 这里需要把密钥复制到软件配置目录下的.ssh目录中, 才能正常使用
    # private-key: ./.ssh/id_ed25519_iu
    private-key: |
      -----BEGIN OPENSSH PRIVATE KEY-----
      b3BlbnNzaC1rZxxxABAAAAMwAAA
      QyNTUxOQAAAxxxAAAIgIqewcCKn
      HAAAAAtxxxDYC8YhlRDIhM+GUeg
      -----END OPENSSH PRIVATE KEY-----

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

> 要是有什么问题, 欢迎留言交流

- 更多内容
  - [这篇文章对应的GitHub博客文档地址](https://iuin8.github.io/doc-record/docs/docker/dev_utls/dev-container/remote-ssh/frp/article/frp+ssh组合镜像以及clash打通网络.md)
