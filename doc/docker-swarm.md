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

## 给node节点添加标签
```shell
docker node update --label-add func=nginx worker1
```

## 创建网络
```shell
docker network create middleware -d overlay --scope swarm 
```

## 部署命令
```shell script
docker stack up -c docker-compose.yml rmq
```
## docker swarm 端口映射问题
```shell
  <serviceName>:
    ports:
      - target: 6379
        published: 6379
        protocol: tcp
        mode: host
```

## docker swarm 端口开放
```shell
# Before starting, verify its status:
systemctl status firewalld
# It should not be running, so start it:
systemctl start firewalld
# Then enable it so that it starts on boot:
systemctl enable firewalld
# Afterwards, reload the firewall:
firewall-cmd --reload
# Then restart Docker.
systemctl restart docker
```
> ###### Note: If you make a mistake and need to remove an entry, type:
> firewall-cmd --remove-port=port-number/tcp —permanent.
> 
> ######On the node that will be a Swarm manager, use the following commands to open the necessary ports:
> firewall-cmd --add-port=2376/tcp --permanent\
> firewall-cmd --add-port=2377/tcp --permanent\
> firewall-cmd --add-port=7946/tcp --permanent\
> firewall-cmd --add-port=7946/udp --permanent\
> firewall-cmd --add-port=4789/udp --permanent
> 
> ######Then on each node that will function as a Swarm worker, execute the following commands:
> firewall-cmd --add-port=2376/tcp --permanent\
> firewall-cmd --add-port=7946/tcp --permanent\
> firewall-cmd --add-port=7946/udp --permanent\
> firewall-cmd --add-port=4789/udp --permanent
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
> docker swarm 端口开放[参考链接](https://www.digitalocean.com/community/tutorials/how-to-configure-the-linux-firewall-for-docker-swarm-on-centos-7)
```shell script
# xml开放端口
# 通过以下命令查找xml文件存放路径(这里查找的是系统存放路径)
find / -name ssh.xml

vi /etc/firewalld/services/docker.xml # 这个是用户存放路径，可能不在这个路径，可以通过上面那条命令查找路径

<?xml version="1.0" encoding="utf-8"?>
      <service>
        <short>docker</short>
        <description>docker daemon for remote access</description>
        <port protocol="tcp" port="2376"/>
        <port protocol="tcp" port="2377"/> # manager节点才需要
        <port protocol="tcp" port="7946"/>
        <port protocol="udp" port="7946"/>
        <port protocol="udp" port="4789"/>
      </service>
      
# 查看默认zone(一般是public)
firewall-cmd --get-default-zone
# 在zone中加入这个service
firewall-cmd --zone=public --add-service=docker --permanent
# 重新加载
firewall-cmd --reload
# 详见linux.md 和 firewalld.md文件
```