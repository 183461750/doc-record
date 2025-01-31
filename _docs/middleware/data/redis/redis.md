---
layout: default
title: '"doc"'
nav_order: 14
description: Redis相关记录
parent: data
has_children: false
permalink: "/middleware/data/redis/redis/"
---

# Redis相关记录

## 导出Redis中的数据

```shell
# 连接redis
redis-cli -h 127.0.0.1 -p 6379 -a foobared
# 导出key数据到文件
keys "*" | xargs redis-cli get > /tmp/redis_data.txt
# 导出指定key数据到文件中
redis-cli get key > /tmp/redis_data.txt
# 使用DUMP命令来导出指定key的数据
redis-cli dump key > /tmp/redis_data.txt
```

- 相关链接
  - [docker数据导出](../../../docker/app/devs/data/redis/doc.md#数据导出)
