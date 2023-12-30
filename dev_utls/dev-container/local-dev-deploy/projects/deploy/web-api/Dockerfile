FROM tomcat:jre8-alpine
WORKDIR /usr/local/tomcat

ENV CATALINA_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=28080"

ENV JAVA_OPTS="-Djava.security.egd=file:/dev/./urandom"

ENV TZ=Asia/Shanghai

ENV https_proxy="http://10.0.16.17:7890" http_proxy="http://10.0.16.17:7890" all_proxy="socks5://10.0.16.17:7890"

RUN rm -rf webapps/* \
    && apk update \
    && apk add --update font-adobe-100dpi ttf-dejavu fontconfig \
    && rm -rf /etc/apk/cache/*

ADD ./target/*.war webapps/web-api.war

EXPOSE 8080
