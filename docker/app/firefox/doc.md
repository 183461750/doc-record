# firefox浏览器相关说明

## 1. 安装

```shell
####### kasmweb版(推荐)
# The container is now accessible via a browser : https://IP_OF_SERVER:6901
# User : kasm_user
# Password: password
docker run --rm -it --shm-size=512m -p 6901:6901 -e VNC_PW=password kasmweb/firefox:1.14.0
```

## 相关文章

- [Docker自建浏览器：让你《随时-随地》访问你内网的光猫路由Nas等Web设备](https://mp.weixin.qq.com/s/8jzfNUlqhnnjjrkbbh0o-Q)
