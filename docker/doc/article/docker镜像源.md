# docker镜像源

[参考文章](https://developer.aliyun.com/article/653081)

```bash
# Docker 官方中国区
# https://registry.docker-cn.com
# 网易
# http://hub-mirror.c.163.com
# ustc
# https://docker.mirrors.ustc.edu.cn

# 测试镜像源
docker run --rm hello-world --registry-mirror=https://registry.docker-cn.com
docker run --rm hello-world --registry-mirror=http://hub-mirror.c.163.com
docker run --rm hello-world --registry-mirror=https://docker.mirrors.ustc.edu.cn

docker run --rm node:14.21.1-slim --registry-mirror=https://registry.docker-cn.com
docker run --rm node:14.21.1-slim --registry-mirror=http://hub-mirror.c.163.com
docker run --rm node:14.21.1-slim --registry-mirror=https://docker.mirrors.ustc.edu.cn

```
