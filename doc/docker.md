## 创建Swarm集群
```shell script
docker swarm init --advertise-addr 192.168.31.43
```
## 查询加入Swarm集群的命令
```shell script
docker swarm join-token manager
```
## 离开Swarm集群
```shell script
docker swarm leave
```