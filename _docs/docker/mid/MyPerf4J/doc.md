---
layout: default
title: doc
parent: mid
nav_order:       13
---

# MyPerf4J是用记录

[github地址](https://github.com/LinShunKang/MyPerf4J)

## java-agent的使用

- 环境变量的配置

```shell
JAVA_TOOL_OPTIONS="$JAVA_TOOL_OPTIONS -javaagent:/Users/fa/dev/projects/java-agents/MyPerf4J-ASM-3.4.0-SNAPSHOT/MyPerf4J-ASM-3.4.0-SNAPSHOT.jar"
```

[MyPerf4J.properties配置文件内容](./java-agent/MyPerf4J.properties)

## influxdb安装

[docker快速部署](https://github.com/influxdata/sandbox.git)

```bash
./sandbox up
```

[docker镜像拉取失败的解决方案](https://github.com/183461750/docker-image-pusher/blob/70e22300d71cca30f14c4ab8e0a99cb9467734e2/README.md)

## grafana可视化界面安装

`docker-compose.yml`版

```bash
services:
  
  grafana:
    image: grafana/grafana:10.0.3
    container_name: grafana
    ports:
      - 3000:3000
    restart: always

```
