# jmap的使用

- 方式一

[java hprof文件如何导出](https://github.com/183461750/doc-record/blob/9ebb07355231f4ae916fdfec741c7e0d044c35ab/materiel/ai/java/java%E4%B8%ADhprof%E6%96%87%E4%BB%B6%E5%A6%82%E4%BD%95%E5%AF%BC%E5%87%BA.md)

```shell
# [root@10-0-1-94 data]# jmap -dump:format=b,file=/data/temp/xxl-job-admin.hprof 24663
# 24663: Unable to open socket file: target process not responding or HotSpot VM not loaded
# The -F option can be used when the target process is not responding

# 示例(PS: AI提供的命令执行失败的话, 加上-F参数)
jmap -F -dump:format=b,file=/data/temp/xxl-job-admin.hprof 24663
```

- 方式二

在启动jar包时候添加参数

[参考文章](https://mp.weixin.qq.com/s/3xCxRxfrz_Y41z7PO-d82g)

```bash

-Xms128M -Xmx128M -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=../xfg-dev-tech-dump/docs/dump

# HeapDumpPath 为你的工程完成路径，到出到 dump 文件夹下。
# 运行方法后，就可以在 docs/dump 就可以看到产生的日志了。

```
