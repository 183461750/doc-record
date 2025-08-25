# 远程调试

主要是为了本地不需要安转office等套件

```Dockerfile
FROM registry.cn-guangzhou.aliyuncs.com/iuin/oraclejdk17:libreoffice-skywalking

COPY build/libs/*.jar /data/app.jar

ENV PORT=9880
ENV JAVA_TOOL_OPTIONS="$JAVA_TOOL_OPTIONS -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:2$PORT"
ENV OFFICE_HOME="/usr/lib/libreoffice"

ENTRYPOINT ["java","-Xms512m","-Xmx4096m","-XX:+UseG1GC","-jar","-Duser.language=zh","-Dserver.port=$PORT","-Djdk.attach.allowAttachSelf=true","-Dnet.bytebuddy.agent.attacher.dump=/tmp/arthas.dump","/data/app.jar"]

EXPOSE $PORT 1$PORT 2$PORT

```

> PS: idea配置中添加容器名, 端口映射和gradle构建(clean bootJar)
> 然后, idea再添加个远程调试配置, 设置IP, 端口以及module即可
> 其他问题: 有可能需要在build.gradle中添加mainClass配置
