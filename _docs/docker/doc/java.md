---
layout: "default"
title: "java"
nav_order: 12
description: "java 相关记录"
parent: "Docker"
has_children: false
permalink: "/docker/doc/java/"
---

# java 相关记录

## 阿里开源jdk

[dragonwell](https://www.aliyun.com/product/dragonwell)

## openjdk下载

[参考链接](https://www.cnblogs.com/haimishasha/p/9909055.html)

    # openjdk官网 
    http://hg.openjdk.java.net/
    
    # 亚马逊发行版
    https://docs.aws.amazon.com/corretto/latest/corretto-8-ug/downloads-list.html
    wget https://corretto.aws/downloads/latest/amazon-corretto-8-x64-linux-jdk.tar.gz
    wget https://corretto.aws/downloads/latest/amazon-corretto-11-x64-linux-jdk.tar.gz

    tar  -zxvf openjdk-8u41-b04-linux-x64-14_jan_2020.tar.gz # 下载后解压

## openjdk编译

    yum install unzip
    unzip openjdk-8u40-src-b25-10_feb_2015.zip
    cd openjdk/
    sudo bash ./configure --with-target-bits=64 --with-boot-jdk=/home/jiazhifeng/workspace/jdk1.7.0_80/ --with-debug-level=slowdebug --enable-debug-symbols ZIP_DEBUGINFO_FILES=0
    sudo make all DISABLE_HOTSPOT_OS_VERSION_CHECK=OK ZIP_DEBUGINFO_FILES=0
> 说明下第一条命令configure用到的参数作用：\
> –with-target-bits=64 ：指定生成64位jdk；\
> –with-boot-jdk=/usr/java/jdk1.7.0_80/：启动jdk的路径；\
> –with-debug-level=slowdebug：编译时debug的级别，有release, fastdebug, slowdebug 三种级别；\
> –enable-debug-symbols ZIP_DEBUGINFO_FILES=0：生成调试的符号信息，并且不压缩；
