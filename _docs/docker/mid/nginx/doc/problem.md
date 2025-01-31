---
layout: default
title: '"problem"'
nav_order: 14
description: nginx相关问题
parent: nginx
has_children: false
permalink: "/docker/mid/nginx/doc/problem/"
---

# nginx相关问题

## 图片访问路径问题

```shell
# 访问路径：
 www.images.mbox58.com/images/aaa/1.jpg
# 使用root(/www/wwwroot/images/images/~~~)
location /images {
    root /www/wwwroot/images/;
    autoindex on;
}
# 使用alias(/www/wwwroot/images/~~~)
location /images {
    alias /www/wwwroot/images/; # 后面的(/)需要带上
    autoindex on;
}
```

## 431 请求头太大问题

- 431 Request Header Fields Too Large

```shell
http {
    client_header_buffer_size 10240k;
    large_client_header_buffers 6 10240k;
}
```

## nginx导致中文字符乱码问题

```shell
# 该配置，如果url路径上有中文会导致中文字符乱码问题
# http://10.0.0.73:10000/apidomain/down/download/report/2022/4/22/参与人积分统计_20220422151521309.csv
    location ~ ^/apidomain(.*) {
        include cors.conf;
        proxy_set_header Host $host;
        proxy_set_header X-real-ip $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://web-api:8080$1?$args;
    }

# 解决方法: 使用以下方式替换即可
    location /apidomain/ {
        include cors.conf;
        proxy_set_header Host $host;
        proxy_set_header X-real-ip $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://web-api:8080/;
    }

```
