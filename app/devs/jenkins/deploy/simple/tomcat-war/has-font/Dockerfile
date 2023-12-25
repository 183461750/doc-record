FROM tomcat:jre8-alpine
WORKDIR /usr/local/tomcat

# 用于远程debug
ENV CATALINA_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=28080"

ENV JAVA_OPTS="-Djava.security.egd=file:/dev/./urandom"

ENV TZ=Asia/Shanghai

# 代理地址，拉取字体需要科学上网
ENV https_proxy="http://10.0.16.17:7890"
ENV http_proxy="http://10.0.16.17:7890"
ENV all_proxy="socks5://10.0.16.17:7890"

RUN rm -rf webapps/* \
    && apk update \
    && apk add --update font-adobe-100dpi ttf-dejavu fontconfig \
    && rm -rf /etc/apk/cache/*
#    && apk cache clean # 这个命令在Cache被禁用的时候会报错

ADD ./target/*.war webapps/web-api.war

EXPOSE 8080
