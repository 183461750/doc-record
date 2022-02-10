## 部署MySQL
```shell
# mysql集群sql命令
# all
show master status

# m1
stop slave

change master to master_host='mysql_m2',master_user='root',master_password='root' ,master_log_file='binlog.000005',master_log_pos=3120045;

reset slave

start slave

show slave status

###########

# m2
stop slave

change master to master_host='mysql_m1',master_user='root',master_password='root' ,master_log_file='binlog.000005',master_log_pos=156;

reset slave

start slave

show slave status

# 当看见Slave_IO_Running: YES、Slave_SQL_Running: YES时，主从复制即完成。


```