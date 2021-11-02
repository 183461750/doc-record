```shell

export app_version='1.0'

cd $DOCKER_WORKSPACE/$JOB_NAME

# 编辑Dockerfile文件
echo "FROM node" > Dockerfile
echo "MAINTAINER Fa" >> Dockerfile
echo "RUN mkdir -p /home/project" >> Dockerfile
echo "WORKDIR /home/project" >> Dockerfile
echo "EXPOSE 3000" >> Dockerfile
echo "CMD npm install --registry=https://registry.npm.taobao.org && npm start" >> Dockerfile

# 构建镜像
docker build -t $JOB_NAME:$app_version .

# 上传镜像到私服
docker tag $JOB_NAME:$app_version registry.docker.com:5000/$JOB_NAME:$app_version
docker push registry.docker.com:5000/$JOB_NAME:$app_version

# 删除空镜像
docker images | awk '{if($1=="<none>")print $3}' | xargs docker rmi &> /dev/null

# 编辑stack yml文件
tee $JOB_NAME.yml <<-'EOF'
version: '3.5'
services:
  $JOB_NAME:
    image: registry.docker.com:5000/$JOB_NAME:${app_version}
    ports:
      - target: 3000
        published: 3230
        mode: host
    volumes:
      - "/var/lib/docker/volumes/jks_jenkins_home/_data/workspace/$JOB_NAME:/home/project"
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