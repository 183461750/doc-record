---
layout: default
title: 如何让docker走代理
nav_order: 13
description: 如何让docker走代理
parent: ai
has_children: false
permalink: "/materiel/ai/docker/如何让docker走代理/"
---

# 如何让docker走代理

在使用 Docker 时让其通过代理来访问网络可以通过以下几种方法实现：

**一、环境变量法**

1. 对于 Linux 和 macOS 系统：
   - 可以在启动 Docker 服务之前设置环境变量。打开终端，输入以下命令临时设置环境变量：
     ```
     export HTTP_PROXY="http://your_proxy_address:port"
     export HTTPS_PROXY="https://your_proxy_address:port"
     ```
   - 如果需要永久设置，可以将这些命令添加到用户的 shell 配置文件中（如 `.bashrc`、`.zshrc` 等）。

2. 对于 Windows 系统：
   - 可以在系统环境变量中设置 `HTTP_PROXY` 和 `HTTPS_PROXY`。
   - 打开“控制面板”->“系统和安全”->“系统”->“高级系统设置”->“环境变量”。在“系统变量”中新建两个变量，变量名分别为 `HTTP_PROXY` 和 `HTTPS_PROXY`，变量值设置为你的代理地址和端口，例如“http://127.0.0.1:8080”。

**二、Docker 守护进程配置法（适用于 Linux）**

1. 编辑 Docker 守护进程的配置文件 `/etc/docker/daemon.json`。如果该文件不存在，可以创建它。
2. 在文件中添加以下内容：
   ```json
   {
     "proxies": {
       "default": {
         "httpProxy": "http://your_proxy_address:port",
         "httpsProxy": "https://your_proxy_address:port",
         "noProxy": "localhost,127.0.0.1,.your_domain.com"
       }
     }
   }
   ```
   - `httpProxy` 和 `httpsProxy` 设置代理地址和端口。
   - `noProxy` 设置不需要通过代理访问的地址列表，用逗号分隔。

3. 保存文件后，重新启动 Docker 服务：
   ```
   sudo systemctl restart docker
   ```

通过以上方法，你可以让 Docker 通过代理来访问网络，以便在网络受限的环境中顺利拉取镜像等操作。


PS: 上面的方式貌似有问题

[参考文章](https://cloud.tencent.com/developer/article/1806455)

```bash
# ~/.docker/config.json
{
 "proxies":
 {
   "default":
   {
     "httpProxy": "http://proxy.example.com:8080",
     "httpsProxy": "http://proxy.example.com:8080",
     "noProxy": "localhost,127.0.0.1,.example.com"
   }
 }
}
```

```bash
docker build . \
    --build-arg "HTTP_PROXY=http://proxy.example.com:8080/" \
    --build-arg "HTTPS_PROXY=http://proxy.example.com:8080/" \
    --build-arg "NO_PROXY=localhost,127.0.0.1,.example.com" \
    -t your/image:tag
```

PS: 但是, 尝试了下好像也没用

之后, 再试试这个参数看看: --network host

PS: 再次尝试了下新的方式(亲测可用)

[参考文章](https://neucrack.com/p/286)

```bash
# sudo vim /etc/systemd/system/docker.service.d/http-proxy.conf
[Service]
Environment="HTTP_PROXY=http://127.0.0.1:8123"
Environment="HTTPS_PROXY=http://127.0.0.1:8123"
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker

```
