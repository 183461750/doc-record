
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

# 过滤某个表的sql
watch java.sql.Statement executeQuery '{params,returnObj,throwExp}'  -x 2 | grep -C 5 "com_commodity_shop"

# 看到的是jpa的非本地sql
watch javax.persistence.EntityManager createQuery '{params,returnObj,throwExp}'  -n 5  -x 3 

```
