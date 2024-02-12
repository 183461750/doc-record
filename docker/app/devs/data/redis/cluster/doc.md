# 部署记录

## TODO

- 测试这个配置的IP调整为服务名，看看是否可行
  - 相关配置文件[redis.yml](./simple/v2/redis.yml)

```shell
echo 'cluster-announce-ip 10.0.16.27' >> redis.conf  &&
# echo 'cluster-announce-ip redis1' >> redis.conf  &&
```
