
# arthas查看sql_redis_es拼接好参数的命令

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

# jpa(完整sql)
watch java.sql.Statement executeQuery '{params,returnObj,throwExp}'  -x 2
# mybatis plus (参数和sql分离)
watch org.apache.ibatis.mapping.BoundSql <init> '{params,returnObj,throwExp}' -x 2

# es
watch org.elasticsearch.client.RestHighLevelClient search '{params,throwExp}' -x 2

# redis
watch org.springframework.data.redis.connection.RedisHashCommands hMSet '{params,returnObj,throwExp}'  -n 5  -x 3 

```
