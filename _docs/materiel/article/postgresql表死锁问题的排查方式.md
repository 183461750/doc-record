---
layout: default
title: '"postgresql表死锁问题的排查方式"'
nav_order: 438
description: postgresql表死锁问题的排查方式_PostgreSQL_脚本之家
has_children: false
permalink: "/materiel/article/postgresql表死锁问题的排查方式/"
created: 2024-06-04T11:38:56 (UTC +08:00)
tags:
- postgresql
- 表死锁
- 排查
source: https://www.jb51.net/article/203560.htm
author:
---

# postgresql表死锁问题的排查方式_PostgreSQL_脚本之家

> ## Excerpt
> 这篇文章主要介绍了postgresql表死锁问题的排查方式，具有很好的参考价值，希望对大家有所帮助。一起跟随小编过来看看吧

---
1.查询激活的执行中的sql,查看有哪些更新update的sql。

select *
from pg_stat_activity
where state = 'active';

2\. 查询表中存在的锁

select a.locktype, a.database, a.pid, a.mode, a.relation, b.relname
from pg_locks a
join pg_class b on a.relation = b.oid
where lower(b.relname) = 'h5_game';

3\. 杀掉死锁进程

select pg_terminate_backend(pid)
from pg_stat_activity
where state = 'active'
and pid != pg_backend_pid()
--and pid = 14172
and pid in (select a.pid
from pg_locks a
join pg_class b on a.relation = b.oid
where lower(b.relname) = 'news_content')

锁模式

/* NoLock is not a lock mode, but a flag value meaning "don't get a lock" */
#define NoLock                 0
 
#define AccessShareLock         1        /* SELECT */
#define RowShareLock          2        /* SELECT FOR UPDATE/FOR SHARE */
#define RowExclusiveLock        3        /* INSERT, UPDATE, DELETE */
#define ShareUpdateExclusiveLock 4       /* VACUUM (non-FULL),ANALYZE, CREATE
                                         * INDEX CONCURRENTLY */
#define ShareLock                5        /* CREATE INDEX (WITHOUT CONCURRENTLY) */
#define ShareRowExclusiveLock  6        /* like EXCLUSIVE MODE, but allows ROW
                                         * SHARE */
#define ExclusiveLock          7        /* blocks ROW SHARE/SELECT...FOR
                                         * UPDATE */
#define AccessExclusiveLock       8        /* ALTER TABLE, DROP TABLE, VACUUM
                                         * FULL, and unqualified LOCK TABLE */

**补充：Postgresql死锁的处理**

背景：

对表进行所有操作都卡住，原因可能是更新表时导致这个表死锁了，开始进行排查

### 解决一：查询pg\_stat\_activity有没有记录

pg版本10.2

select pid,query,* from pg_stat_activity where datname='死锁的数据库' and wait_event_type = 'Lock';
select pg_cancel_backend('死锁那条数据的pid值');##只能杀死select 语句, 对其他语句不生效
pg_terminate_backend('死锁那条数据的pid值');#select,drop等各种操作

执行后发现select和delete表时正常执行，但truncate和drop表时会一直运行，也不报错。

“drop table” 和 “truncate table” 需要申请排它锁"ACCESS EXCLUSIVE"， 执行这个命令卡住时，说明此时这张表上还有操作正在进行，比如查询等，

那么只有等待这个查询操作完成，“drop table” 或"truncate table"或者增加字段的SQL才能获取这张表上的 "ACCESS EXCLUSIVE"锁，操作才能进行下去。

### 解决二：查询pg\_locks是否有这个对象的锁

select oid,relname from pg_class where relname='table name';
select locktype,pid,relation,mode,granted,* from pg_locks where relation= '上面查询出来的oid';
select pg_terminate_backend('进程ID');

问题解决！！！

坑：一开始不知道pg\_cancel\_backend(‘死锁那条数据的pid值');##只能杀死select 语句, 对其他语句不生效，杀了进程查询发现还存在，反复杀反复存在，换了pg\_terminate\_backend(‘进程ID')问题就解决了。

以上为个人经验，希望能给大家一个参考，也希望大家多多支持脚本之家。如有错误或未考虑完全的地方，望不吝赐教。

原文链接：https://blog.csdn.net/fsstyle/article/details/87917720
