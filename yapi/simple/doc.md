## Jenkins配置
```shell

cd $DOCKER_WORKSPACE/$JOB_NAME


# 创建docker mongo.yml文件(执行一次就好了)
tee mongo.yml <<-'EOF'

version: "3.5"

services:
  
  mongo:
    image: mongo
    environment:
      - MONGO_INITDB_DATABASE=yapi
      - MONGO_INITDB_ROOT_USERNAME=root
      - MONGO_INITDB_ROOT_PASSWORD=root
    ports:
      - target: 27017
        published: 27017
        mode: host
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
  mongo_data_db:

networks:
  middleware:
    external: true

EOF

# 启动
docker stack up -c mongo.yml data


# 自定义配置文件 config.json
# 其中管理员账号在下面配置，密码默认为ymfe.org
tee config.json <<-'EOF'

{
  "port": "3000",
  "adminAccount": "admin@admin.com",
  "timeout":120000,
  "db": {
    "servername": "_MONGO_SERVER_NAME",
    "DATABASE": "yapi",
    "port": 27017,
    "user": "root",
    "pass": "root",
    "authSource": "admin"
  }
}

EOF

# 自定义配置文件 docker-entrypoint.sh
tee docker-entrypoint.sh <<-'EOF'
#!/bin/bash

# set -eo pipefail

declare -A PAGE_PARAMS=(

  ["_MONGO_SERVER_NAME"]="mongo"

)

for index in "${!PAGE_PARAMS[@]}";

do

  ENV_VAL=`eval echo '$'${index}`

  [ -z "${ENV_VAL}" ] && ENV_VAL=${PAGE_PARAMS[$index]}

  echo "text repeat: ${index}-->${ENV_VAL}"
  echo "$(/bin/sed "s!${index}!${ENV_VAL}!g" /yapi/config.json)" > /yapi/config.json;

done

exec "$@"

EOF

# 创建Dockerfile文件
tee Dockerfile <<-'EOF'

FROM node:12-alpine as builder
WORKDIR /yapi
RUN apk add --no-cache wget python3 make
ENV VERSION=1.9.3
RUN wget https://github.com/YMFE/yapi/archive/v${VERSION}.zip
RUN unzip v${VERSION}.zip && mv yapi-${VERSION} vendors
RUN cd vendors && npm install --production --registry https://registry.npm.taobao.org

FROM node:12-alpine
MAINTAINER 183461750@qq.com
ENV TZ="Asia/Shanghai"
ENV MONGO_SERVER_NAME=mongo
WORKDIR /yapi/vendors
COPY --from=builder /yapi/vendors /yapi/vendors
COPY config.json ../config.json
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
RUN echo -e http://mirrors.ustc.edu.cn/alpine/v3.15/main/ > /etc/apk/repositories
RUN apk add --no-cache bash
EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server/app.js"]

EOF

# app构建版本号
export app_version='1.0'

# 构建镜像
docker build -t $JOB_NAME:$app_version .

# 上传镜像到私服
docker tag $JOB_NAME:$app_version registry.docker.com:5000/$JOB_NAME:$app_version
docker push registry.docker.com:5000/$JOB_NAME:$app_version

# 创建docker yapi.yml文件
tee $JOB_NAME.yml <<-'EOF'

version: "3.5"

services:
  
  $JOB_NAME:
    image: registry.docker.com:5000/$JOB_NAME:${app_version}
    ports:
      - target: 3000
        published: 3000
        mode: host
    environment:
      MONGO_SERVER_NAME: mongo
    depends_on:
      - mongo
    volumes:
      - yapi_log:/home/vendors/log
      - ./config.json:/yapi/config.json
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

networks:
  middleware:
    external: true

EOF

# 启动
docker stack up -c $JOB_NAME.yml open_app

```