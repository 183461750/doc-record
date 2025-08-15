# cpolar+ssh+docker打通受限网络

解压frp压缩文件, 将里面的frpc文件重命名为jumpboxc, 给Dockerfile中的copy命令使用

## 使用方式

```yaml

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
    extra_hosts:
      - "prod.xxx.customer:host-gateway"
    restart: unless-stopped

```

需要调整的字段

- serverAddr: 服务端地址
- serverPort: 服务端口
- auth_token: 认证token
- client_name: 客户端名称
- customDomains: 自定义域名
- extra_hosts: 额外自定义容器hosts配置(可选)
