FROM tomcat:jre8-alpine

#将webapp下的全部删除
RUN rm -rf /usr/local/tomcat/webapps/*

#将target下的xx.war拷贝到/usr/local/tomcat/webapps/下
ADD ./target/*.war /usr/local/tomcat/webapps/

#端口
EXPOSE 8080

#设置启动命令
# ENTRYPOINT ["/usr/local/tomcat/bin/catalina.sh","run"]

# docker build -t wap-api .
# docker run -d --network middleware -p 8081:8080 wap-api

# 文件名 叫 ROOT.war
# curl http://localhost:8081/test/redis?key=a&value=b
