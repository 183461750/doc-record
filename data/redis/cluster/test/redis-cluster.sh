#!/bin/bash

# 定义 Redis 容器的服务名称和网络名称
SERVICE_NAME_PREFIX="data_redis"
SERVICE_PORT_PREFIX=700
NETWORK_NAME="middleware"

# 构建 redis-cli 命令
CMD="redis-cli --cluster create"

for i in 1 2 3 4 5 6
do
    SERVICE_NAME=$SERVICE_NAME_PREFIX$i
    # 获取 Redis 容器的 IP 地址列表
    IP=$(docker service inspect --format='{{range .Endpoint.VirtualIPs}}{{.Addr}}{{end}}' $SERVICE_NAME | sed 's/\/24//g')
    # 拼接 Redis 容器的 IP 地址和端口
    CMD="$CMD $IP:$SERVICE_PORT_PREFIX$i"
    echo "$SERVICE_NAME IP: $IP"
done

CMD="yes yes | $CMD --cluster-replicas 1 -a foobared"

echo "CMD: $CMD"

# 执行 redis-cli 命令创建 Redis Cluster
docker run --rm --network $NETWORK_NAME redis:6.0 bash -c "$CMD"