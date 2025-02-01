---
layout: default
title: doc
nav_order: 16
description: Jenkins使用maven
parent: Maven
has_children: false
permalink: "/docker/app/devs/jenkins/doc/maven/maven/"
grand_parent: Doc
---

# Jenkins使用maven

- 下载到指定位置
  
```bash
cd /var/lib/docker/volumes/web_jenkins_home/_data/
mkdir -p ./soft/maven
cd /var/lib/docker/volumes/web_jenkins_home/_data/soft/maven

wget https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.8.4/apache-maven-3.8.4-bin.zip
unzip apache-maven-3.8.4-bin.zip

```

- 对应jenkins中的配置

```bash
# maven安装路径配置
/var/jenkins_home/soft/maven
```
