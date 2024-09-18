# 进程

## 没有足够的资源创建本地线程

### java.lang.OutOfMemoryError: unable to create new native thread

- 确认资源是否够

```bash
# 查看资源不够的应用是由哪个用户启动的(这里示例为www用户启动)
su www

# 查看用户最大进程数(PS: 不同用户查看到的最大用户进程数不一样)
ulimit -a
# max user processes              (-u) 4096

# 当前用户占用的总线程数
top -H 

```

- 修改用户最大进程数

```bash
# 查看资源不够的应用是由哪个用户启动的(这里示例为www用户启动)
su www

vim /etc/security/limits.d/90-nproc.conf
# 写入以下内容
# soft nproc 40960
# hard nproc 40960

```

- 解决权限不足的问题

```bash
# 如果是www用户没有写入权限(方法一: 直接用root用户去写入就行, 方法二: 用root用户去修改文件权限)
chmod o+w /etc/security/limits.d/90-nproc.conf
```
