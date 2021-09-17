## 创建网络
```shell
docker network create -d  overlay --attachable middleware

docker network create --driver=overlay --gateway 192.168.1.1 --subnet 192.168.1.0/24 --attachable my_network
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