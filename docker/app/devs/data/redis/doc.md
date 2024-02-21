# Redis相关记录

## 数据导出

```shell
# 使用exec和DUMP命令导出数据
docker exec -it <你的Redis容器名或ID> redis-cli -a foobared DUMP your_key_name > /path/to/your/key.dump
# 使用临时容器导出数据
docker run --rm --link <你的Redis容器名或ID>:redis -it redis redis-cli -h redis DUMP your_key_name > /path/to/your/key.dump
```

- 相关链接
  - [数据导出](../../../../../middleware/data/redis/doc.md#导出redis中的数据)
  
## 监听命令

```shell
# 监听是否执行了指定key
docker exec -it 017daffcd5a3 redis-cli -c -p 7001 -a foobared MONITOR | grep "xx:key"
```
