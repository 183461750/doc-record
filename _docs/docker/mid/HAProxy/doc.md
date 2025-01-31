---
layout: "default"
title: "doc"
nav_order: 13
description: "部署MySQL```shell mysql开启集群的sql命令"
parent: "mid"
has_children: false
permalink: "/docker/mid/HAProxy/doc/"
---

## 部署MySQL
```shell
# mysql开启集群的sql命令

# 设置sql执行模式为幂等的（例如，insert主键冲突时，将sql改为delete加insert）（非必须）
set global replica_exec_mode=idempotent;
show global VARIABLES like "%exec_mode%";

# all 用于查看SOURCE_LOG_FILE和SOURCE_LOG_POS的值
show master status

# host1执行
STOP REPLICA for channel 'channel1';
RESET REPLICA for channel 'channel1';
CHANGE REPLICATION SOURCE to SOURCE_HOST='mysql_m2',SOURCE_PORT=3306,SOURCE_LOG_FILE='binlog.000008',SOURCE_LOG_POS=156 for channel 'channel1';
RESET REPLICA for channel 'channel1';
START REPLICA USER='root' PASSWORD='root' for channel 'channel1';

# 查看状态。当看见Slave_IO_Running: YES、Slave_SQL_Running: YES时，主从复制即完成。
SHOW REPLICA STATUS;

###########

# host2执行
STOP REPLICA for channel 'channel1';
RESET REPLICA for channel 'channel1';
CHANGE REPLICATION SOURCE to SOURCE_HOST='mysql_m1',SOURCE_PORT=3306,SOURCE_LOG_FILE='binlog.000008',SOURCE_LOG_POS=156 for channel 'channel1';
RESET REPLICA for channel 'channel1';
START REPLICA USER='root' PASSWORD='root' for channel 'channel1';

# 查看状态。当看见Slave_IO_Running: YES、Slave_SQL_Running: YES时，主从复制即完成。
SHOW REPLICA STATUS;

```
# Last_SQL_Errno
```shell
1007：数据库已存在，创建数据库失败
1008：数据库不存在，删除数据库失败
1049：创建表时，发现数据库不存在
1050：数据表已存在，创建数据表失败
1051：数据表不存在，删除数据表失败
1054：字段不存在，或程序文件跟数据库有冲突
1060：字段重复，导致无法插入
1061：重复键名
1068：定义了多个主键
1094：位置线程ID
1146：数据表缺失，请恢复数据库
1053：复制过程中主服务器宕机
1062：主键冲突 Duplicate entry '%s' for key %d
```
