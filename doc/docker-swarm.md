## 创建Swarm集群
```shell script
docker swarm init --advertise-addr 192.168.31.43
# --advertise-addr参数表示其它swarm中的worker节点使用此ip地址与manager联系。
docker swarm init --advertise-addr enp0s8
# --advertise-addr 该参数也可使用网卡名
```
## 查询加入Swarm集群的命令
```shell script
docker swarm join-token manager
```
## 离开Swarm集群
```shell script
docker swarm leave
```
## 部署命令
```shell script
docker stack up -c docker-compose.yml rmq
```