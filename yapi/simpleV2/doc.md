# yapi

## 部署

- [参考地址](https://github.com/fjc0k/docker-YApi)

```shell
git clone https://github.com/fjc0k/docker-YApi.git
# 无法访问 github 的可使用国内镜像：
git clone https://gitee.com/fjc0k/docker-YApi.git
# 接下来，修改 docker-compose.yml 中 yapi-web 下的环境变量 YAPI_ADMIN_ACCOUNT 为你的管理员邮箱，YAPI_ADMIN_PASSWORD 为你的管理员密码。

# 最后，执行 docker-compose up -d 启动服务。

# 然后，通过 http://localhost:40001 即可访问 YApi。
```
