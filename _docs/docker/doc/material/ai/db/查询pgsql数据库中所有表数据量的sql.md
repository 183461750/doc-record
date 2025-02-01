---
layout: default
title: 查询pgsql数据库中所有表数据量的sql
nav_order: 15
description: 查询pgsql数据库中所有表数据量的sql
parent: Db
has_children: false
permalink: "/docker/doc/material/ai/db/查询pgsql数据库中所有表数据量的sql/"
grand_parent: Ai
---

# 查询pgsql数据库中所有表数据量的sql

以下是查询 PostgreSQL 数据库中所有表数据量的 SQL 语句的示例：

方法一：使用 pg_class 表

```sql
SELECT relname AS table_name, reltuples AS row_count
FROM pg_class
WHERE relkind = 'r'
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

这个查询语句会返回所有表的表名和对应的数据量。你可以将 `public` 替换为你要查询的实际 schema 名称。

方法二：使用 pg_stat_user_tables 视图

```sql
SELECT schemaname, relname, n_live_tup AS row_count
FROM pg_stat_user_tables;
```

这个查询语句会返回所有用户表的 schema 名称、表名和对应的数据量。

以上是查询 PostgreSQL 数据库中所有表数据量的 SQL 语句示例。你可以根据具体的需求选择适合的方法进行查询。

参考资料：

- [postgresql 查询当前schema下所有表数据的数量 - 程序猿网友666 - 博客园][[1]](https://www.cnblogs.com/chenghu/p/17201210.html)
- [PostgreSQL 查询所有表的记录数_pg查询所有表的数据量-CSDN博客][[2]](https://blog.csdn.net/londa/article/details/109046131)
- [查看PostgreSQL数据库中所有表_pg查看库内表-CSDN博客][[3]](https://blog.csdn.net/huangbaokang/article/details/88862791)

---
Learn more:

1. [postgresql 查询当前schema下所有表数据的数量 - 程序猿网友666 - 博客园](https://www.cnblogs.com/chenghu/p/17201210.html)
2. [PostgreSQL 查询所有表的记录数_pg查询所有表的数据量-CSDN博客](https://blog.csdn.net/londa/article/details/109046131)
3. [查看PostgreSQL数据库中所有表_pg查看库内表-CSDN博客](https://blog.csdn.net/huangbaokang/article/details/88862791)
