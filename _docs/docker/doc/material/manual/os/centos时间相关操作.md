---
layout: default
title: centos时间相关操作
nav_order: 15
description: centos时间相关操作
parent: Os
has_children: false
permalink: "/docker/doc/material/manual/os/centos时间相关操作/"
grand_parent: Manual
---

# centos时间相关操作

设置时区（CentOS 7）
先执行命令timedatectl status|grep 'Time zone'查看当前时区，如果不是中国时区（Asia/Shanghai），则需要先设置为中国时区，否则时区不同会存在时差。

```shell
#已经是Asia/Shanghai，则无需设置
[root@xiaoz shadowsocks]# timedatectl status|grep 'Time zone'
       Time zone: Asia/Shanghai (CST, +0800)
```

执行下面的命令设置时区

```shell
#设置硬件时钟调整为与本地时钟一致
timedatectl set-local-rtc 1
#设置时区为上海
timedatectl set-timezone Asia/Shanghai
```

使用ntpdate同步时间
目前比较常用的做法就是使用ntpdate命令来同步时间，使用方法如下：

```shell
#安装ntpdate
yum -y install ntpdate
#同步时间
ntpdate -u  pool.ntp.org
#同步完成后,date命令查看时间是否正确
date
```

另外再分享下几个常用的ntp server，如果需要更多可以前往：<http://www.ntp.org.cn>获取

```shell
#中国
cn.ntp.org.cn
#中国香港
hk.ntp.org.cn
#美国
us.ntp.org.cn
```

同步时间后可能部分服务器过一段时间又会出现偏差，因此最好设置crontab来定时同步时间，方法如下：

```shell
#安装crontab
yum -y install crontab
#创建crontab任务
crontab -e
#添加定时任务
*/20 * * * * /usr/sbin/ntpdate pool.ntp.org > /dev/null 2>&1
#重启crontab
service crond reload
```

上面的计划任务会在每20分钟进行一次时间同步，注意/usr/sbin/ntpdate为ntpdate命令所在的绝对路径，不同的服务器可能路径不一样，可以使用which命令来找到绝对路径，方法如下：

```shell
[root@xiaoz ~]# which ntpdate
/usr/sbin/ntpdate
```

使用rdate同步时间
ntpdate服务需要使用udp/123端口，但是某些服务商禁止了所有UDP协议，所以你会发现无论如何ntpdate总是同步出错。

```shell
#下方是ntpdate同步时间报错的一个列子
[root@sharktech ~]# ntpdate -u  pool.ntp.org
 1 Jun 16:13:46 ntpdate[8389]: no server suitable for synchronization found
```

这个时候我们可以改用rdate命令来同步时间，方法如下：

```shell
#安装rdate
yum -y install rdate
#同步时间
rdate -s time-b.nist.gov
#查看时间是否正确
date
```

和上面一样，我们最好是加入定时任务来定期同步时间，方法如下：

```shell
#安装crontab
yum -y install crontab
#创建crontab任务
crontab -e
#添加定时任务
*/20 * * * * /usr/bin/rdate -s time-b.nist.gov > /dev/null 2>&1
#重启crontab
service crond reload
```

还有一些其它的rdate时间服务器如下：

```shell
s1d.time.edu.cn #东南大学
s1e.time.edu.cn #清华大学
s2a.time.edu.cn #清华大学
s2b.time.edu.cn #清华大学
s2c.time.edu.cn #北京邮电大学
ntp.sjtu.edu.cn 202.120.2.101 #(上海交通大学网络中心NTP服务器地址）
s1a.time.edu.cn #北京邮电大学
s1b.time.edu.cn #清华大学
s1c.time.edu.cn #北京大学
clock.cuhk.edu.hk #香港中文大学授时中心
```

总结
无论是使用ntpdate还是rdate来同步时间，方法都比较简单，大致流程就是“设置时区” -> “同步时间” -> “设置定时任务”。在实际的测试中，xiaoz发现部分服务商屏蔽UDP端口的情况下，ntpdate命令无法同步，但使用rdate命令却可以，有类似情况的童鞋不妨试一下。
