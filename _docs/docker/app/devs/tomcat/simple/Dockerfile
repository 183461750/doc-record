FROM tomcat:8.5

#维护者
MAINTAINER Fa

#将webapp下的全部删除
RUN rm -rf /usr/local/tomcat/webapps/*

#将target下的xx.war拷贝到/usr/local/tomcat/webapps/下
ADD ./target/*.war /usr/local/tomcat/webapps/

#端口
EXPOSE 8080

#设置启动命令
ENTRYPOINT ["/usr/local/tomcat/bin/catalina.sh","run"]