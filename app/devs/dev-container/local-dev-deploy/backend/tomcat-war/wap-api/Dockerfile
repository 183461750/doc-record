FROM tomcat:jre8-alpine
WORKDIR /usr/local/tomcat

ENV CATALINA_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=28080"

RUN rm -rf webapps/*
ADD ./target/*.war webapps/wap-api.war
EXPOSE 8080
