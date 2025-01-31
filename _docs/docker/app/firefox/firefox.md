---
layout: default
title: '"doc"'
nav_order: 13
description: firefox浏览器相关说明
parent: app
has_children: false
permalink: "/docker/app/firefox/firefox/"
---

# firefox浏览器相关说明

## 1. 安装

```shell
####### kasmweb版(推荐)
# The container is now accessible via a browser : https://IP_OF_SERVER:6901
# User : kasm_user
# Password: password
docker run --rm -it --shm-size=512m -p 6901:6901 -e VNC_PW=password kasmweb/firefox:1.14.0
```

- mac系统的docker可用的容器镜像

[仓库地址](https://github.com/jlesage/docker-firefox)

```bash
# 简单命令
docker run -d --name=firefox -p 5800:5800 -e LANG=zh_CN.UTF-8 -e ENABLE_CJK_FONT=1 jlesage/firefox

# VNC版
docker run -d --name firefox -e TZ=Asia/Hong_Kong -e LANG=zh_CN.UTF-8 -e KEEP_APP_RUNNING=1 -e ENABLE_CJK_FONT=1  -e VNC_PASSWORD=admin  -p 5800:5800 -p 5900:5900 -v /data/firefox/config:/config:rw --shm-size 2g jlesage/firefox

```

## 相关文章

- [Docker自建浏览器：让你《随时-随地》访问你内网的光猫路由Nas等Web设备](https://mp.weixin.qq.com/s/8jzfNUlqhnnjjrkbbh0o-Q)
