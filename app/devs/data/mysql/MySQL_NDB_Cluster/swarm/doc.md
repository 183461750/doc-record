# docker swarm版部署文档

## 创建网络

```shell
# 初始化swarm
sudo docker swarm  init
# 创建可手动连接的swarm网络
sudo docker network create --driver=overlay --subnet=10.0.4.0/16 --gateway=10.0.4.1 --attachable prod-cluster
```

## 启动集群

```shell
sudo docker stack deploy -c docker-compose.yml mysqlCluster
```

## 参考资料

- [docker环境安装MySQL-Cluster](http://t.csdnimg.cn/9KmNs)
