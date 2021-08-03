## 创建网络
```shell
docker network create -d  overlay --attachable middleware
```

## 使用host模式
```shell script
docker run --net="host" 
docker-compose -f file.yml up # yml 文件中，在services:[serviceName]:network_mode: "host"
docker stack up -c file.yml 
# yml 文件中
# services:
#   nginx:
#     networks:
#       hostnet: {}
# networks:
#   hostnet:
#     external: true
#     name: host
```