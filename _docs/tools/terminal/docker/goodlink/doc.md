---
layout: "default"
title: "doc"
nav_order: 14
description: "两台主机之间直连"
parent: "Docker"
has_children: false
permalink: "/tools/terminal/docker/goodlink/doc/"
---

# 两台主机之间直连

## docker启动

```bash
docker rm goodlink -f
# remote
docker run -d --name=goodlink --net=host --restart=always registry.cn-shanghai.aliyuncs.com/kony/goodlink --key=nas_202412140928
# local
docker run -d --name=goodlink --net=host --restart=always registry.cn-shanghai.aliyuncs.com/kony/goodlink --local=127.0.0.1:18080 --key=nas_202412140928

# 以上两个命令执行后, 如果联通了的话, 那就是通过clash等代理软件可以访问remote端的所有端口
# 目标: 在家里电脑(或出差电脑)浏览器上配置代理: socks5://127.0.0.1:18080, 访问公司所有内网 WEB, 和在公司无异
# 由于remote和local两端默认使用的算法不一样, 如果出现超过10分钟无法连接的情况, 可能是其中一端和默认的算法不兼容, 此时可在local端增加 "--conn=1" 选项, 以调换两端的算法, 就能连接了
```

## 命令方式

```bash
chmod +x ./goodlink-linux-amd64
./goodlink-linux-amd64 --key=nas_202412140928
./goodlink-linux-arm64 --local=127.0.0.1:18080 --key=nas_202412140928
# 后台执行, 收集日志到文件中(PS: 2>&1 作用为将标准错误重定向到标准输出, 即写入goodlink.log日志文件)
nohup ./goodlink-linux-amd64 --key=nas_202412140928 > ./goodlink.log 2>&1 &
```

- 异常

- [参考文章](https://github.com/quic-go/quic-go/wiki/UDP-Buffer-Sizes)

```bash
sysctl -w net.core.rmem_max=7500000
sysctl -w net.core.wmem_max=7500000
```
