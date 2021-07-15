## 该jenkins实例似乎已离线
    安装插件那个页面，就是提示你offline的那个页面，不要动。
    然后打开一个新的tab，输入网址http://192.168.211.103:8080/jenkins/pluginManager/advanced。 
    这里面最底下有个【升级站点】，把其中的链接由https改成http的就好了，http://updates.jenkins.io/update-center.json。 
    然后在服务列表中关闭jenkins，再tomcat重新启动，这样就能正常联网了
