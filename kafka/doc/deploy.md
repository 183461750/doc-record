# 启动集群
docker stack deploy -c kafkacompose.yml kafka
# 启动集群（two）
docker stack deploy --compose-file=kafka-docker-compose.yml tools