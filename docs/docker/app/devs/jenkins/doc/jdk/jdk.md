
# jenkins中使用jdk

- 下载到指定位置

```bash
cd /var/lib/docker/volumes/web_jenkins_home/_data/
mkdir -p ./soft/jdk
cd /var/lib/docker/volumes/web_jenkins_home/_data/soft/jdk

wget https://corretto.aws/downloads/latest/amazon-corretto-8-x64-linux-jdk.tar.gz
tar  -zxvf openjdk-8u41-b04-linux-x64-14_jan_2020.tar.gz

```

- 对应Jenkins中的配置

```bash
# jdk安装路径配置
/var/jenkins_home/soft/jdk
```
