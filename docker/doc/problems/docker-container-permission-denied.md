# docker容器没权限问题

1. 创建docker容器时，指定`--privileged`参数

## docker gid 查看命令

[参考地址1](https://www.doubao.com/thread/w9e714164e14f12b9)
[参考地址2](https://github.com/influxdata/sandbox/issues/79)(PS: 貌似没啥用的样子)
[参考地址3](https://github.com/influxdata/sandbox/issues/83)

```bash
stat -c '%g' /var/run/docker.sock
```
