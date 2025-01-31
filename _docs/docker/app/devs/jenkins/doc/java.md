---
layout: default
title: java
nav_order: 15
description: java 启动 相关记录
parent: jenkins
has_children: false
permalink: "/docker/app/devs/jenkins/doc/java/"
---

# java 启动 相关记录

- [参考文章](http://www.javashuo.com/article/p-mdhxsxqr-eq.html)

```shell
nohup java -Xms500m -Xmx500m -Xmn250m -Xss256k -server -XX:+HeapDumpOnOutOfMemoryError -jar $JAR_PATH/test-0.0.1-SNAPSHOT.jar --spring.profiles.active=daily -verbose:class &
## 说明：
# --spring.profiles.active=daily， 这个能够在spring-boot启动中指定系统变量，多环境(测试、预发、线上配置)的区分
# 在排查jar包冲突时，能够指定启动的-verbose:class  打印出启动的应用实际加载类的路径，来排查来源。
# jvm堆设值： -Xms500m -Xmx500m -Xmn250m -Xss256k
# nohup 不挂断地运行命令；& 在后台运行 ，通常两个一块儿用。 eg：nohup command &
# -server:服务器模式，在多个CPU时性能佳，启动慢但性能好，能合理管理内存。
# -XX:+HeapDumpOnOutOfMemoryError：在堆溢出时保存快照
```

```shell
## -server和-client具体说明：
# -server：必定要做为第一个参数，在多个 CPU 时性能佳，还有一种叫 -client 的模式，特色是启动速度比较快，但运行时性能和内存管理效率不高，一般用于客户端应用程序或开发调试，在 32 位环境下直接运行 Java 程序默认启用该模式。Server 模式的特色是启动速度比较慢，但运行时性能和内存管理效率很高，适用于生产环境，在具备 64 位能力的 JDK 环境下默认启用该模式，能够不配置该参数。
```
