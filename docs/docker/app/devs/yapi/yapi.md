
## Dockerfile
```shell
FROM node:12-alpine as builder
WORKDIR /yapi
RUN apk add --no-cache wget python make
ENV VERSION=1.9.2
RUN wget https://github.com/YMFE/yapi/archive/v${VERSION}.zip
RUN unzip v${VERSION}.zip && mv yapi-${VERSION} vendors
RUN cd /yapi/vendors && cp config_example.json ../config.json && npm install --production --registry https://registry.npm.taobao.org

FROM node:12-alpine
MAINTAINER 545544032@qq.com
ENV TZ="Asia/Shanghai"
WORKDIR /yapi/vendors
COPY --from=builder /yapi/vendors /yapi/vendors
EXPOSE 3000
ENTRYPOINT ["node"]
```
```shell
tee Dockerfile <<-'EOF'
FROM node:12-alpine as builder
WORKDIR /yapi
RUN apk add --no-cache wget python make
ENV VERSION=1.9.3
RUN wget https://github.com/YMFE/yapi/archive/v${VERSION}.zip
RUN unzip v${VERSION}.zip && mv yapi-${VERSION} vendors
RUN cd /yapi/vendors && cp config_example.json ../config.json && npm install --production --registry https://registry.npm.taobao.org

FROM node:12-alpine
MAINTAINER 183461750@qq.com
ENV TZ="Asia/Shanghai"
WORKDIR /yapi/vendors
COPY --from=builder /yapi/vendors /yapi/vendors
EXPOSE 3000
ENTRYPOINT ["node"]
EOF

```
## 构建镜像
```shell
docker build -t yapi .
```
## yapi升级
```shell

# 1、停止并删除旧版容器
docker rm -f yapi

# 2、获取最新镜像
docker pull registry.cn-hangzhou.aliyuncs.com/anoyi/yapi

# 3、启动新容器
docker run -d \
  --name yapi \
  --link mongo-yapi:mongo \
  --workdir /yapi \
  -p 3000:3000 \
  -v $PWD/config.json:/config.json \
  registry.cn-hangzhou.aliyuncs.com/anoyi/yapi \
  server/app.js
```
## Jenkins配置
```shell

cd $DOCKER_WORKSPACE/$JOB_NAME

# 创建Dockerfile文件
tee Dockerfile <<-'EOF'

FROM node:12-alpine as builder
WORKDIR /yapi
RUN apk add --no-cache wget python3 make
ENV VERSION=1.9.2
RUN wget https://github.com/YMFE/yapi/archive/v${VERSION}.zip
RUN unzip v${VERSION}.zip && mv yapi-${VERSION} vendors
RUN cd /yapi/vendors && cp config_example.json ../config.json && npm install --production --registry https://registry.npm.taobao.org

FROM node:12-alpine
MAINTAINER 183461750@qq.com
ENV TZ="Asia/Shanghai"
WORKDIR /yapi/vendors
COPY --from=builder /yapi/vendors /yapi/vendors
EXPOSE 3000
# ENTRYPOINT ["node"]
ENTRYPOINT ["node", "./server/app.js"]

EOF

# app构建版本号
export app_version='1.0'

# 构建镜像
docker build -t $JOB_NAME:$app_version .

# 上传镜像到私服
docker tag $JOB_NAME:$app_version registry.docker.com:5000/$JOB_NAME:$app_version
docker push registry.docker.com:5000/$JOB_NAME:$app_version

# 自定义配置文件 config.json
tee config.json <<-'EOF'

{
  "port": "3000",
  "adminAccount": "183461750@qq.com",
  "timeout":120000,
  "db": {
    "servername": "mongo",
    "DATABASE": "yapi",
    "port": 27017,
    "user": "anoyi",
    "pass": "anoyi.com",
    "authSource": "admin"
  }
}

EOF

# 创建docker yapi.yml文件
tee $JOB_NAME.yml <<-'EOF'

version: "3.5"

services:
  
  $JOB_NAME:
    image: registry.docker.com:5000/$JOB_NAME:${app_version}
    environment:
      - VERSION=1.5.6
      - LOG_PATH=/tmp/yapi.log
      - HOME=/home
      - PORT=3000
      - ADMIN_EMAIL=test@test.com
      - DB_SERVER=mongo
      - DB_NAME=yapi
      - DB_PORT=27017
    ports:
      - target: 3000
        published: 3000
        mode: host
    volumes:
      - yapi_log:/home/vendors/log
      - ./config.json:/yapi/config.json
    depends_on:
      - mongo
    networks:
      middleware:
    deploy:
      replicas: 1
      update_config:
        parallelism: 1
      restart_policy:
        condition: on-failure

  mongo:
    image: mongo
    environment:
      - MONGO_INITDB_ROOT_USERNAME=anoyi
      - MONGO_INITDB_ROOT_PASSWORD=anoyi.com
    volumes:
      - mongo_data_db:/data/db
    networks:
      middleware:
    deploy:
      replicas: 1
      update_config:
        parallelism: 1
      restart_policy:
        condition: on-failure

volumes:
  yapi_log:
  mongo_data_db:

networks:
  middleware:
    external: true

EOF

# 启动
docker stack up -c $JOB_NAME.yml open_app

```
