# 构建tomcat应用的相关记录

## 环境变量

- 系统管理 -> 系统配置 -> 全局属性 -> 环境变量 -> 新增键值对
- DOCKER_JENKINS_WORKSPACE : /var/lib/docker/volumes/soft_jenkins_home/_data/workspace

## 构建脚本

- maven 构建

```shell
# Goals and options
clean install -Dmaven.test.skip=true -Pprivate -Djava.awt.headless=true
```

- send build artifacts over SSH (Transfers Set -> Exec command)

```shell
# 第四版(swarm+私服)
# docker images | awk '{if($1=="$JOB_NAME") print $3}' | xargs docker rmi
# published: 8280 # todo 映射端口根据实际调整

export app_version='1.0'

cd $DOCKER_JENKINS_WORKSPACE/$JOB_NAME

# 编辑Dockerfile文件
tee Dockerfile <<-'EOF'
FROM tomcat:8.5-jdk8-corretto"
MAINTAINER Fa"
WORKDIR /usr/local/tomcat"
RUN rm -rf webapps/*"
ADD ./target/*$JOB_NAME webapps/$JOB_NAME"
EXPOSE 8080"
EOF

# 构建镜像
docker build -t $JOB_NAME:$app_version .

# 上传镜像到私服
docker tag $JOB_NAME:$app_version registry.docker.com:5000/$JOB_NAME:$app_version
docker push registry.docker.com:5000/$JOB_NAME:$app_version

# 删除空镜像
docker images | awk '{if($1=="<none>")print $3}' | xargs docker rmi 

# 编辑stack yml文件
tee $JOB_NAME.yml <<-'EOF'
version: '3.5'
services:
  $JOB_NAME:
    image: registry.docker.com:5000/$JOB_NAME:${app_version}
    ports:
      - target: 8080
        published: 8280
        mode: host
    volumes:
      - /home/data/file:/usr/local/tmp/web-api/uploads/
    networks:
      - middleware
    deploy:
      replicas: 1
      update_config:
        parallelism: 1
      restart_policy:
        condition: on-failure

networks:
  middleware:
    external: true

EOF

docker stack up -c $JOB_NAME.yml app

```
