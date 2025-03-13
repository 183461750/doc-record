FROM tomcat:jre8-alpine
WORKDIR /usr/local/tomcat
ADD ./deploy/.env ./deploy/.env
ADD ./deploy/docker-start.sh ./deploy/docker-start.sh
RUN rm -rf webapps/*
ADD ./target/war/* webapps/app.war
EXPOSE 8080

#设置启动命令
ENTRYPOINT ["sh","./deploy/docker-start.sh","run"]
# docker build -t madata .
# docker run -p8080:8080 -d madata