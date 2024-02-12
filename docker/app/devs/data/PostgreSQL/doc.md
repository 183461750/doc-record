# postgresql数据库相关文档

## 部署

- [参考文章](http://t.csdn.cn/awC63)
- 使用的容器为[bitnami/postgresql:latest]

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
# 默认配置文件`/www/gfs-share/postgresql/conf/postgresql.conf`
# 创建自定义配置文件`/www/gfs-share/postgresql/conf/conf.d/custom.conf`
# 最大连接数，默认是100
max_connections = 10000

# 查看最大连接数
show max_connections;
```

## 备份数据

```bash
docker exec -it fc870c5cd426 pg_dump --dbname=iuin --create --clean --if-exists --user aaa
````
