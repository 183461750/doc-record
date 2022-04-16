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
