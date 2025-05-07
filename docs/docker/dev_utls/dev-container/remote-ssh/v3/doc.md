# v3 version

## 待办

- 隧道名称, 添加到环境变量中, 可自定义(暂时不需要了)
- 其他高级操作
  - `cpolar.yml`文件通过挂载的方式进行自定义(挂载配置文件即可)
- docker-compose.yml结合export命令使用, 这样token就不容易看到了

## 使用方式

```bash
# docker-compose.yml配置内容
services:
  cpolar-ssh:
    image: registry.cn-hangzhou.aliyuncs.com/iuin/cpolar-ssh:latest
    environment:
      - TZ="Asia/Shanghai"
      - CPOLAR_AUTH_TOKEN=${CPOLAR_AUTH_TOKEN}
      - CPOLAR_CONTANER_SSH_NAME=contaner_ssh_1
    restart: unless-stopped
    privileged: true 


export CPOLAR_AUTH_TOKEN=xxx
docker compose up -d

# 进cpolar官网页面查看域名

# ~/.ssh/config配置

Host cpolar.internet.company
  HostName 3.tcp.cpolar.top
  User root
  Port 11968
  IdentityFile ~/.ssh/id_ed25519_1
  # ForwardAgent yes
  # 让远程机器使用本地的代理(可以访问google了)
  # RemoteForward 127.0.0.1:9090 192.168.0.218:9090
  # PasswordAuthentication password

# 通过ssh远程连接容器
ssh cpolar.internet.company
```
