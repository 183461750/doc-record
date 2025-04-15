# 星空组网 使用记录

[官网-管理后台](https://starvpn.cn/user/index.html#)

## docker方式安装

```bash
docker run -d \
  --restart=always \
  --privileged \
  --net=host \
  --name stars.client \
  -e STARS_USER=zhangshan:001 \
  -e STARS_PASS=123456 \
  registry.cn-beijing.aliyuncs.com/ld_beijing/stars.client:5.1.1
```

docker-compose方式安装(./docker/docker-compose.yml)
