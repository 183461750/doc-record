---
layout: default
title: '"arthas查看sql"'
nav_order: 12
description: arthas查看sql
parent: materiel
has_children: false
permalink: "/materiel/article/arthas查看sql/"
---

# arthas查看sql

[参考文章](http://codefun007.xyz/a/article_detail/2392.htm)

```bash

watch java.sql.Connection prepareStatement '{params,throwExp}'    -x 3 
watch java.sql.Statement executeQuery '{params,throwExp}'    -x 3 

watch org.apache.ibatis.mapping.BoundSql getSql '{params,returnObj,throwExp}'    -x 3 

```

- temp

```bash

watch java.sql.Statement executeQuery '{params,returnObj,throwExp}'  -n 5  -x 3 
watch java.sql.Statement executeQuery '{params,returnObj,throwExp}'  -x 3 
watch java.sql.Statement executeQuery '{params,returnObj,throwExp}'  -x 2

# 看到的是jpa的非本地sql
watch javax.persistence.EntityManager createQuery '{params,returnObj,throwExp}'  -n 5  -x 3 

```
