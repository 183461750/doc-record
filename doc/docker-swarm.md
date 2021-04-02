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

## docker swarm 端口开放
```shell
# docker machine
firewall-cmd --add-port=2376/tcp --permanent
# manager
firewall-cmd --add-port=2377/tcp --permanent
# communication among nodes (container network discovery).
firewall-cmd --add-port=7946/tcp --permanent
firewall-cmd --add-port=7946/udp --permanent
# overlay network traffic (container ingress networking).
firewall-cmd --add-port=4789/udp --permanent

# 2376 用于docker machine 在实体机，一般不需要。

```
