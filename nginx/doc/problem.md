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