FROM tomcat:jre8-alpine
WORKDIR /usr/local/tomcat
RUN rm -rf webapps/*
ADD ./target/*.war webapps/wap-api.war
EXPOSE 8080
