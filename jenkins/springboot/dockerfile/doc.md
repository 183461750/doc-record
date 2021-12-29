## maven使用dockerfile插件构建项目
- springboot pom.xml配置
```xml
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <java.version>1.8</java.version>
        <maven.test.skip>true</maven.test.skip>
        <spring-cloud.version>Finchley.RELEASE</spring-cloud.version>
        <dockerfile.maven.version>1.4.3</dockerfile.maven.version>
        <!-- 首先确保，配置的docker.image.prefix时正确的，即配置了绑定仓库。 -->
        <docker.image.prefix>registry.docker.com:5000</docker.image.prefix>
        <appPort>8880</appPort>
    </properties>
<!-- build -> plugins -->
    <plugin>
        <groupId>com.spotify</groupId>
        <artifactId>dockerfile-maven-plugin</artifactId>
        <version>1.4.13</version>
        <executions>
            <execution>
                <id>default</id>
                <goals>
                    <goal>build</goal>
                    <goal>push</goal>
                </goals>
            </execution>
        </executions>
        <configuration>
            <!-- 注意，repository的格式必须为：<username>/<repository_name>
             username就是登录Docker Hub的用户名，例如我的用户名是longyonggang。
            repository_name就是上一步在Docker Hub上创建的repository名字。 -->
            <repository>${docker.image.prefix}/app/${project.build.finalName}</repository>
            <tag>${project.version}</tag>
            <buildArgs>
                <JAR_FILE>${project.build.finalName}.jar</JAR_FILE>
                <APP_PORT>${project.build.finalName}.jar</APP_PORT>
            </buildArgs>
        </configuration>
    </plugin>
```
- springboot application.yml配置
```yaml
server:
  port: @appPort@
logging:
  level:
    root: info
spring:
  application:
    name: @project.name@
#    com.example.demo.repository.UserRepository: debug
```
- Dockerfile文件配置 > tip: 放到项目根目录下
```Dockerfile
#FROM openjdk:8-jdk-alpine
FROM hub.c.163.com/dwyane/openjdk:8
VOLUME /tmp
WORKDIR /workdir
ARG JAR_FILE
ARG APP_PORT
ADD target/${JAR_FILE} app.jar
#ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","app.jar"]
ENTRYPOINT ["java","-jar","app.jar"]
EXPOSE ${APP_PORT}
```
- 执行mvn clean package > 访问私有仓库看构建情况: http://registry.docker.com:5000/v2/

- 编辑/etc/sysconfig/docker文件，我安装的docker ce，没有发现这个文件，如果有，则：
```shell
sudo vi /etc/sysconfig/docker

//添加下面这行
other_args="-H tcp://0.0.0.0:2375 -H unix:///var/run/docker.sock"

//保存
:wq!
 
//重启docker服务
service docker restart
```
- 在windows系统环境变量中新建DOCKER_HOST值为tcp://{docker_ip}:2375，将这里的{docker_ip}，替换为docker所在的centos服务器IP或主机名（用主机名，需要windows配置hosts)，可能需要重启系统。
- 修改/usr/lib/systemd/system/docker.service文件
```shell
sudo vi /usr/lib/systemd/system/docker.service
//在ExecStart这一行后面加上（这里就写4个0，别改成自己的ip） 
-H tcp://0.0.0.0:2375 -H unix:///var/run/docker.sock
 
改完后效果如下
ExecStart=/usr/bin/dockerd -H tcp://0.0.0.0:2375 -H unix:///var/run/docker.sock
 
:wq!
保存退出

重新加载配置文件 systemctl daemon-reload
重启docker ：service docker restart
这样才可以是/etc/default/docker中的配置项生效
```
- 我们首先查询docker所在虚拟机在监听哪些端口，使用命令：
```shell
netstat -tlunp
# 显示
# tcp6       0      0 :::2375                 :::*                    LISTEN      -

# 2375端口，已在监听。
# 那很有可能时防火墙的问题，在CentOS7中，默认会打开firewalld防火墙，如果防火墙打开后，默认情况下只会监听在22号端口，也就是说主机对外暴露的端口只有22。
# 使用如下命令：
sudo iptables-save
# 查看防火墙暴漏的对外端口，发现2373端口没有对位暴漏。
# 需要增加2375端口对外暴漏，使用如下命令：
# 添加端口
sudo firewall-cmd --zone=public --add-port=2375/tcp --permanent
# 重载防火墙
sudo firewall-cmd --reload
# 看到sucess字样后，再使用iptables-save命令查看端口，可以看到，对外放开的端口增加了2375端口。
```