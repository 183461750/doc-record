FROM tomcat:8.5.39-alpine

RUN rm -rf /usr/local/tomcat/webapps/ROOT

RUN apk add tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata