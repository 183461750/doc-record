# 节点小宝使用记录

[官网](https://www.iepose.com/)

```bash
# 安装

## docker
# x86_64
docker run -d --net host --name owjdxb -v "$(pwd)/store:/data/store" --restart always ionewu/owjdxb
# arm_64
# docker run -d --net host --name owjdxb -v "$(pwd)/store:/data/store" --restart always ionewu/owjdxb_a64
docker run -d --net host --name owjdxb -v "./temp/store:/data/store" --restart always ionewu/owjdxb_a64

```

```bash
# 设备码绑定
# 启动容器后可在日志中查看6位设备码
# docker logs ionewu/owjdxb
docker logs owjdxb

```
