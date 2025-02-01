---
layout: default
title: doc
nav_order: 16
description: mysql相关记录
parent: Doc
has_children: false
permalink: "/docker/app/devs/data/mysql/doc/doc/"
grand_parent: Mysql
---

# mysql相关记录

## 连接数据库

```bash
# 方式一：直接在宿主机中执行命令
mysql -h $hostname -u $username -p
```

## 备份数据(包含表数据和ddl结构)

```bash
# 方式一：进入容器中执行命令，将结果写入到控制台中
mysqldump -h $hostname -u $username -p $database $table

# 方式二：宿主机中执行命令，并将结果写入到指定文件中
echo "$password" | docker exec -i $container_id mysqldump -h $hostname -u $username -p $database $table > $table.sql

# 方式三：运行一次性容器执行命令，并将结果写入到指定文件中
echo "$password" | docker run -i --rm mysql:5.7 mysqldump -h $hostname -u $username -p $database $table > $table.sql
```

```bash
# 导出整个库
echo "$password" | docker run -i --rm mysql:5.7 mysqldump -h $hostname -u $username -p $database > ./backup/$database.sql

```

## 导出数据(指定sql)

```bash
# 方式一: 进入容器中执行命令，将结果写入到控制台中
mysql -h <host> -u <username> -p<password> -e "<sql_query>" <database_name> > <output_file>

# 方式二: 宿主机中执行命令，并将结果写入到指定文件中
docker exec -i <containerId> mysql -h <host> -u <username> -p<password> -e "<sql_query>" <database_name> > <output_file>

# 方式三：运行一次性容器执行命令，并将结果写入到指定文件中
docker run -i --rm mysql:5.7 mysql -h <host> -u <username> -p<password> -e "<sql_query>" <database_name> > <output_file>

# 方式四: 用方式二的命令，导出数据到csv文件中
docker exec -i <containerId> mysql -h <host> -u <username> -p<password> -e "<sql_query>" <database_name> | sed 's/\t/","/g;s/^/"/;s/$/"/' > <output_file>


```
