# 构建tomcat应用的相关记录

## 环境变量

- 系统管理 -> 系统配置 -> 全局属性 -> 环境变量 -> 新增键值对
- DOCKER_JENKINS_WORKSPACE : /var/lib/docker/volumes/soft_jenkins_home/_data/workspace

## jdk配置

```shell
# 新建目录
cd /var/lib/docker/volumes/soft_jenkins_home/_data && mkdir -p ./soft/jdks
# 下载jdk
wget https://corretto.aws/downloads/latest/amazon-corretto-8-x64-linux-jdk.tar.gz
wget https://corretto.aws/downloads/latest/amazon-corretto-11-x64-linux-jdk.tar.gz
# 解压
tar -zxvf amazon-corretto-8-x64-linux-jdk.tar.gz

# 系统管理 -> 全局工具配置 -> JDK
# JAVA_HOME(/var/jenkins_home/soft/jdks/amazon-corretto-8.332.08.1-linux-x64)
```

## maven配置

```shell
# 下载Maven Integration插件

# 自定义settings.xml的配置
cd /var/lib/docker/volumes/soft_jenkins_home/_data && mkdir -p ./soft/maven
code settings.xml
# 复制./conf/settings.xml文件内容
# 修改标签<localRepository>内容
# 调整[系统管理 -> 全局工具配置 -> Maven 配置]
# 默认(和全局) settings 提供 -> 文件系统中的 settings 文件 -> 文件路径(/var/jenkins_home/soft/maven/settings.xml)
# maven v3.6.3
```

---

## 构建脚本

- maven 构建
- 构建 -> 添加构建步骤 -> 调用顶层 maven 目标

```shell
# 目标
clean install -Dmaven.test.skip=true -Pprivate -Djava.awt.headless=true

# 也可替换为以下命令
clean package -D maven.test.skip=true -P prod help:active-profiles
```

- 执行 shell
- 将镜像上传到私仓
- PS: Jenkins的部署需要使用remote/jenkins.yml文件部署(主要是需要在容器内使用docker命令)

```shell

export app_version=${BUILD_NUMBER}

cd $WORKSPACE

# 编辑Dockerfile文件
tee Dockerfile <<-'EOF'
FROM openjdk:11-jre-slim
WORKDIR /workdir
ADD ./target/*.jar app.jar
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080
ENTRYPOINT java -jar -Djava.security.egd=file:/dev/./urandom -Dspring.profiles.active=$SPRING_PROFILES_ACTIVE -Dserver.port=$SERVER_PORT app.jar
EXPOSE 8080
EOF

# 登录阿里云私仓 todo <username>和<password>需要手动替换成真实的数据
echo <password> | docker login -u <username> --password-stdin registry.cn-zhangjiakou.aliyuncs.com

# 构建镜像
docker build -t $JOB_NAME:$app_version .

# 上传镜像到私服
docker tag $JOB_NAME:$app_version registry.cn-zhangjiakou.aliyuncs.com/fa/$JOB_NAME:$app_version
docker push registry.cn-zhangjiakou.aliyuncs.com/fa/$JOB_NAME:$app_version

# 删除本地镜像
docker rmi registry.cn-zhangjiakou.aliyuncs.com/fa/$JOB_NAME:$app_version

# 退出阿里云私仓
docker logout

```

- send build artifacts over SSH (Transfers Set -> Exec command)
- 选择远程ssh server，在远程服务器上启动docker容器

```shell

export app_version=${BUILD_NUMBER}

# 创建工作目录
mkdir -p /www/temp/jenkins/docker
cd /www/temp/jenkins/docker

# 编辑stack yml文件
tee $JOB_NAME.yml <<-'EOF'
version: '3.5'
services:
  $JOB_NAME:
    image: registry.cn-zhangjiakou.aliyuncs.com/fa/$JOB_NAME:${app_version}
    environment:
      TZ: "Asia/Shanghai"
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

docker stack up -c $JOB_NAME.yml app --with-registry-auth

```
