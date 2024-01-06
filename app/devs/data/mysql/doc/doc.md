# mysql相关记录

## 连接数据库

```bash
# 方式一：直接在宿主机中执行命令
mysql -h $hostname -u $username -p
```

## 备份数据

```bash
# 方式一：进入容器中执行命令，将结果写入到控制台中
mysqldump -h $hostname -u $username -p $database $table

# 方式二：宿主机中执行命令，并将结果写入到指定文件中
echo "$password" | docker exec -i $container_id mysqldump -h $hostname -u $username -p $database $table > $table.sql
```
