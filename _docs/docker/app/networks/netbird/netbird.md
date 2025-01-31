---
layout: default
title: '"doc"'
nav_order: 14
description: netbird使用
parent: networks
has_children: false
permalink: "/docker/app/networks/netbird/netbird/"
---

# netbird使用

- 使用docker安装

```bash
docker run --rm -d \
   --cap-add=NET_ADMIN \
   -e NB_SETUP_KEY=SETUP_KEY \
   -v netbird-client:/etc/netbird \
   netbirdio/netbird:latest
# https://docs.netbird.io/how-to/getting-started#running-net-bird-in-docker
```

- 参考链接
  - [官方地址](https://app.netbird.io)
  - [B站视频](https://www.bilibili.com/video/BV1hm4y1G7P4/?buvid=XX830E687E1A6043634FE5BA62D04AE61B60C&is_story_h5=false&mid=KVrRvQIgah%2BvjvHS%2FHBsSQ%3D%3D&p=1&plat_id=106&share_from=ugc&share_medium=android&share_plat=android&share_session_id=05eed0e5-fa80-4055-b974-b0626f52d8a0&share_source=WEIXIN&share_tag=s_i&spmid=main.space-contribution.0.0&timestamp=1700946217&unique_k=I33DBjq&up_id=1323796788)
