# 路由侠使用记录

[官网docker使用地址](https://help.luyouxia.com/docker.html)
[官网管理后台](https://www.luyouxia.com/console/)

```bash
# x86_64：

wget https://dl.luyouxia.com:8443/v2/lyx-docker-x86_64.tar
docker load -i lyx-docker-x86_64.tar

# arm64：

wget https://dl.luyouxia.com:8443/v2/lyx-docker-arm64.tar
docker load -i lyx-docker-arm64.tar

# code需要管理后台获取
docker run --name lyx -it --restart=always --net=host -e code=这里填写安装码 luyouxia/lyx


```
