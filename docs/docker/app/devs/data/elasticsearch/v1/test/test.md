
# es部署文档

## 启动命令

```shell
docker stack deploy -c docker-compose-es-cluster-tls.yml es
```

## 检查集群部署是否正常

```shell
在kibana的Dev Tools中访问：GET /_cat/nodes,显示如下结果：

10.0.1.64 20 54 12 0.98 1.87 4.47 cdhilmrstw - es03
10.0.1.62 51 54 12 0.98 1.87 4.47 cdhilmrstw - es02
10.0.1.60 57 54 12 0.98 1.87 4.47 cdhilmrstw * es01
```

## 参考文章

- [docker swarm 搭建ES集群（TLS版）](https://www.cnblogs.com/JentZhang/p/17227129.html)
