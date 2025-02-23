---
layout: default
title: tomcat-file-2
nav_order: 15
description: 构建tomcat应用的相关记录
parent: Doc
has_children: false
permalink: "/docker/app/devs/jenkins/doc/tomcat-file-2/"
grand_parent: Jenkins
---

# 构建tomcat应用的相关记录

```shell
# 第四版(swarm+私服)
# docker images | awk '{if($1=="$JOB_NAME") print $3}' | xargs docker rmi
# published: 8280 # todo 映射端口根据实际调整

export app_version='1.0'

cd $DOCKER_WORKSPACE/$JOB_NAME

# 编辑server.xml文件
tee tomcat-server.xml <<-'EOF'
<?xml version="1.0" encoding="UTF-8"?>

<Server port="8005" shutdown="SHUTDOWN">
  <Listener className="org.apache.catalina.startup.VersionLoggerListener" />
  <Listener className="org.apache.catalina.core.AprLifecycleListener" SSLEngine="on" />
  <Listener className="org.apache.catalina.core.JreMemoryLeakPreventionListener" />
  <Listener className="org.apache.catalina.mbeans.GlobalResourcesLifecycleListener" />
  <Listener className="org.apache.catalina.core.ThreadLocalLeakPreventionListener" />

  <GlobalNamingResources>

    <Resource name="UserDatabase" auth="Container"
              type="org.apache.catalina.UserDatabase"
              description="User database that can be updated and saved"
              factory="org.apache.catalina.users.MemoryUserDatabaseFactory"
              pathname="conf/tomcat-users.xml" />
  </GlobalNamingResources>

  <Service name="Catalina">

    <Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443"
               URIEncoding="utf-8" />

    <Engine name="Catalina" defaultHost="localhost">

      <Realm className="org.apache.catalina.realm.LockOutRealm">

        <Realm className="org.apache.catalina.realm.UserDatabaseRealm"
               resourceName="UserDatabase"/>
      </Realm>

      <Host name="localhost"  appBase="webapps"
            unpackWARs="true" autoDeploy="true">

        <Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
               prefix="localhost_access_log" suffix=".txt"
               pattern="%h %l %u %t &quot;%r&quot; %s %b" />

      </Host>
    </Engine>
  </Service>
</Server>
EOF

# 编辑Dockerfile文件
tee Dockerfile <<-'EOF'
FROM tomcat:8.5-jdk8-corretto
MAINTAINER Fa
WORKDIR /usr/local/tomcat
RUN rm -rf webapps/*
ADD ./target/*$JOB_NAME webapps/ROOT

RUN rm -rf ./conf/server.xml
ADD ./tomcat-server.xml ./conf/server.xml

EXPOSE 8080
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
