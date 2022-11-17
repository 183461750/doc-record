# postgresql数据库相关文档

## 部署

- [参考文章](http://t.csdn.cn/awC63)

```shell
# 创建目录
mkdir -p /www/gfs-share/postgresql/data/ /www/gfs-share/postgresql/conf/
# 调整目录权限
sudo chown 1001:1001 /www/gfs-share/postgresql/data/
sudo chown 1001:1001 /www/gfs-share/postgresql/conf/

# 启动容器
docker stack up -c postgresql.yml data

```

- 后期配置

```shell
# 到这个文件`/www/gfs-share/postgresql/conf/postgresql.conf`去修改配置，在文件最底部加上
# 最大连接数，默认是100
max_connections = 10000

# 查看最大连接数
show max_connections;
```
