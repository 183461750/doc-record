# firefox浏览器相关说明

## 1. 安装

```shell
docker run -d --name firefox -e TZ=Asia/Hong_Kong  -e DISPLAY_WIDTH=1920 -e DISPLAY_HEIGHT=1080 -e KEEP_APP_RUNNING=1 -e ENABLE_CJK_FONT=1  -e VNC_PASSWORD=Dean  -p 5800:5800 -p 5900:5900 -v /data/firefox/config:/config:rw --shm-size 2g jlesage/firefox

# 使用环境变量文件, 例如, 代理配置的环境变量
docker run -d --name firefox -e TZ=Asia/Hong_Kong  -e DISPLAY_WIDTH=1920 -e DISPLAY_HEIGHT=1080 -e KEEP_APP_RUNNING=1 -e ENABLE_CJK_FONT=1  -e VNC_PASSWORD=Dean  -p 5800:5800 -p 5900:5900 -v /data/firefox/config:/config:rw --shm-size 2g --env-file .env jlesage/firefox

# 使用host网络
docker run -d --name firefox -e TZ=Asia/Hong_Kong  -e DISPLAY_WIDTH=1920 -e DISPLAY_HEIGHT=1080 -e KEEP_APP_RUNNING=1 -e ENABLE_CJK_FONT=1  -e VNC_PASSWORD=Dean -v /data/firefox/config:/config:rw --shm-size 2g --env-file .env --net host jlesage/firefox

# 使用host网络
docker run -d --name firefox -e TZ=Asia/Hong_Kong  -e DISPLAY_WIDTH=1920 -e DISPLAY_HEIGHT=1080 -e KEEP_APP_RUNNING=1 -e ENABLE_CJK_FONT=1  -e VNC_PASSWORD=Dean -e https_proxy=http://10.0.4.228:7890 -e http_proxy=http://10.0.4.228:7890 -e all_proxy=socks5://10.0.4.228:7890 -v /data/firefox/config:/config:rw --shm-size 4g --net host jlesage/firefox

####### selenium版, 假的, 不知道是什么来的
# docker run -d -p 4444:4444 -p 7900:7900 --shm-size="2g" selenium/standalone-firefox:latest

# docker run -d -e https_proxy=http://10.0.4.228:7890 -e http_proxy=http://10.0.4.228:7890 -e all_proxy=socks5://10.0.4.228:7890 --shm-size="2g" --net host selenium/standalone-firefox:latest

####### kasmweb版(推荐)
# The container is now accessible via a browser : https://IP_OF_SERVER:6901
# User : kasm_user
# Password: password
docker run --rm -it --shm-size=512m -p 6901:6901 -e VNC_PW=password kasmweb/firefox:1.14.0

docker run --rm -it --shm-size=512m -p 6901:6901 -e VNC_PW=password kasmweb/firefox:1.14.0

```

## 相关文章

- [Docker自建浏览器：让你《随时-随地》访问你内网的光猫路由Nas等Web设备](https://mp.weixin.qq.com/s/8jzfNUlqhnnjjrkbbh0o-Q)
