# frps使用记录

在v3的基础上, 加上了`tcpmuxHTTPConnectPort`参数, 用于一个端口支持多个ssh连接

## 快速开始

[v3 doc](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/dev-container/remote-ssh/frp/server/v3/doc.md)

[network_mode(目前使用的方式)](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/dev-container/remote-ssh/frp/server/v4/simple/network_mode/docker-compose.yml)

```bash
# 启动即可
docker-compose up -d
```

- 配置说明

`7000`端口 # 服务端口, 用于客户端连接时指定的端口, 调整个合适的值即可
`5002`端口 # 用于多个ssh连接的端口, 调整个合适的值即可
`auth_token` # 认证token, 用于客户端连接时验证身份, 调整个合适的值即可
