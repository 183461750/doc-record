
# 禅道

## 执行命令

```shell

docker run --name zentao -p 8888:80 --mac-address 02:42:ac:11:00:00 -v /home/data/docker/zentao/www/zentaopms:/www/zentaopms -v /home/data/docker/zentao/www/mysqldata:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 -d easysoft/zentao

```
