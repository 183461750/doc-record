# frpc使用记录

## 快速开始

[docker-compose.yml链接](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/dev-container/remote-ssh/frp/v6/simple/docker-compose.yml)

```bash
# 启动即可
docker-compose up -d
```

- 配置说明

`auth_token_line=auth.token = "xxx"` # 认证token, 用于客户端连接时验证身份, 调整个合适的值即可
`serverAddr` # 服务端地址, 用于客户端连接时指定的地址, 调整个合适的值即可
`server_port=18000` # 服务端口, 用于客户端连接时指定的端口, 调整个合适的值即可
`client_name=frpc` # 客户端名称, 用于客户端连接时指定的名称, 调整个合适的值即可(同一frps服务端, 可以有多个frpc客户端连接, 只要名称不冲突即可)
`remotePort_proxies_tcp_line: remotePort=12222` # 远程端口, 用于客户端连接时指定的端口, 调整个合适的值即可

> PS: 基本上服务端固定的情况下, 只需要把第一个client的docker-compose文件复制出来, 修改`client_name`, `remotePort_proxies_tcp_line`即可

- 已经有一个frpc客户端连接的情况下, 如何添加新的frpc客户端(以及获取ssh密钥)

```bash
# 复制一份docker-compose.yml文件, 修改client_name和remotePort_proxies_tcp_line即可(docker-compose.yml文件中有注释说明)

# 然后, ssh连接需要获取密钥, 执行以下命令获取ssh的私钥
docker exec -it dev-jumpbox cat ~/.ssh/id_ed25519_frp
# 需要将这个私钥配置到本地的~/.ssh/id_ed25519_frp中, 并调整权限
chmod 600 ~/.ssh/id_ed25519_frp
```
