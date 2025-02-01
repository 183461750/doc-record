---
layout: default
title: doc
nav_order: 14
description: clickhouse
parent: Clickhouse
has_children: false
permalink: "/middleware/data/clickhouse/clickhouse/"
grand_parent: Data
---

# clickhouse

## 安装指定版本

[参考官网](https://clickhouse.com/docs/zh/getting-started/install#from-tgz-archives)

```bash
# 执行安装脚本(中途需要输入`default`用户的密码, 以及是否允许默认用户从任何地方访问)
# 脚本中的`LATEST_VERSION`环境变量可以填写想要安装的版本号，默认为最新稳定版(可以在这里找版本[https://github.com/ClickHouse/ClickHouse/tags])
bash ./clickhouse-install.sh
# 启动
sudo /etc/init.d/clickhouse-server start
# 连接
clickhouse-client
# 示例
SELECT 1
```
