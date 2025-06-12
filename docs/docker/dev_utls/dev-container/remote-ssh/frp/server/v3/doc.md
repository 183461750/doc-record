# frps使用记录

在v2的基础上, 加上了server绑定端口的环境变量配置功能

## 快速开始

[docker-compose.yml链接](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/dev-container/remote-ssh/frp/server/v3/simple/docker-compose.yml)

```bash
# 启动即可
docker-compose up -d
```

- 配置说明

`auth_token_line=auth.token = "xxx"` # 认证token, 用于客户端连接时验证身份, 调整个合适的值即可
`bindPort=18000` # 服务端口, 用于客户端连接时指定的端口, 调整个合适的值即可
