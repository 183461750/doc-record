## 创建 6 个 Redis 容器
```shell
docker create --name redis-node1 --net host -v /data/redis-data/node1:/data redis:5.0.5 --cluster-enabled yes --cluster-config-file nodes-node-1.conf --port 6379

docker create --name redis-node2 --net host -v /data/redis-data/node2:/data redis:5.0.5 --cluster-enabled yes --cluster-config-file nodes-node-2.conf --port 6380

docker create --name redis-node3 --net host -v /data/redis-data/node3:/data redis:5.0.5 --cluster-enabled yes --cluster-config-file nodes-node-3.conf --port 6381

docker create --name redis-node4 --net host -v /data/redis-data/node4:/data redis:5.0.5 --cluster-enabled yes --cluster-config-file nodes-node-4.conf --port 6382

docker create --name redis-node5 --net host -v /data/redis-data/node5:/data redis:5.0.5 --cluster-enabled yes --cluster-config-file nodes-node-5.conf --port 6383

docker create --name redis-node6 --net host -v /data/redis-data/node6:/data redis:5.0.5 --cluster-enabled yes --cluster-config-file nodes-node-6.conf --port 6384
```
- 部分参数解释：
```
--cluster-enabled：是否启动集群，选值：yes 、no
--cluster-config-file 配置文件.conf ：指定节点信息，自动生成
--cluster-node-timeout 毫秒值： 配置节点连接超时时间
--appendonly：是否开启持久化，选值：yes、no
```
## 启动 Redis 容器
```shell
docker start redis-node1 redis-node2 redis-node3 redis-node4 redis-node5 redis-node6
```
## 组建 Redis 集群
```shell
# 这里以 redis-node1 实例为例
docker exec -it redis-node1 /bin/bash
# 组建集群,10.211.55.4为当前物理机的ip地址
redis-cli --cluster create 10.211.55.4:6379 10.211.55.4:6380 10.211.55.4:6381 10.211.55.4:6382 10.211.55.4:6383 10.211.55.4:6384 --cluster-replicas 1
# 创建成功后，通过 redis-cli 查看一下集群节点信息：
root@CentOS7:/data# redis-cli
127.0.0.1:6379> cluster nodes
```
## 关于Redis集群搭建
```shell
# 手动添加节点
redis-cli --cluster add-node 10.211.55.4:6383 10.211.55.4:6379  --cluster-slave --cluster-master-id b0c32b1dae9e7b7f7f4b74354c59bdfcaa46f30a

redis-cli --cluster add-node 10.211.55.4:6384 10.211.55.4:6379  --cluster-slave --cluster-master-id 111de8bed5772585cef5280c4b5225ecb15a582e
```