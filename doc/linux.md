## 安装docker并配置加速器
```shell script
yum -y install docker
```

## 修改主机名
```shell script
hostnamectl set-hostname manager43
``` 

## 配置hosts文件(可配置可不配置)
```shell script
vi /etc/hosts
```
```
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
 
192.168.31.43 manager43
192.168.31.188 node188
192.168.31.139 node139
```

## 使用scp复制到node主机
```shell script
scp /etc/hosts root@192.168.31.188:/etc/hosts
```

## 查看防火墙
```shell
`firewall-cmd --zone=public --list-ports` 和 `netstat -tlunp`
```

## 设置防火墙
```shell script
systemctl disable firewalld.service
systemctl stop firewalld.service
```
```shell script
# 防火墙配置
# 官方文档

# centos7采用firewalld来配置防火墙，默认不开放接口。官方文档中给出的方案比较底层。这里我们采取自定义Service的方式来配置

# 创建文件
vi /etc/firewalld/services/docker.xml
# 加入以下内容
<?xml version="1.0" encoding="utf-8"?>
      <service>
        <short>docker</short>
        <description>docker daemon for remote access</description>
        <port protocol="tcp" port="2375"/>
      </service>
# 查看默认zone(一般是public)
firewall-cmd --get-default-zone
# 在zone中加入这个service
firewall-cmd --zone=public --add-service=docker --permanent
# 重新加载
firewall-cmd --reload
# 查询端口
firewall-cmd --service=docker --get-ports --permanent
# 参考链接
https://my.oschina.net/u/4560825/blog/4314028
```

## 添加dns
```shell
vi /etc/sysconfig/network-scripts/ifcfg-enp0s3
# DNS2=114.114.114.114
systemctl restart network
vi /etc/resolv.conf # 查看结果
```

## 配置yum镜像源
```shell
# 备份你的原镜像文件，以免出错后可以恢复
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
# 下载新的CentOS-Base.repo 到/etc/yum.repos.d/
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
# 进入CentOS-Base.repo文件, 修改文件中的baseurl地址(可省略这步)
vi   CentOS-Base.repo
# 清楚原有yum缓存
yum clean all
# 生成缓存
yum makecache
# 查看配置好的yum源是否正常
yum repolist
```
## 安装docker
```shell script
# 使用官方安装脚本自动安装
# 安装命令如下：

curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
# 也可以使用国内 daocloud 一键安装命令：

curl -sSL https://get.daocloud.io/docker | sh
```
```shell
# 安装需要的软件包， yum-util 提供yum-config-manager功能，另外两个是devicemapper驱动依赖的
yum install -y yum-utils device-mapper-persistent-data lvm2
# 配置镜像源
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
# 通过命令把https://download-stage.docker.com替换为http://mirrors.aliyun.com/docker-ce
vi /etc/yum.repos.d/docker-ce.repo
# 命令如下：
:%s#https://download.docker.com#http://mirrors.aliyun.com/docker-ce#g
# 更新yum缓存
yum makecache fast
# 这时，可通过阿里镜像安装doker了
yum install docker-ce
```

## 监控命令
```shell
# 查看服务状态，一秒一次，启动之后可通过IP：端口访问界面
watch -n 1 docker stack services hadoop
```

## 打印信息
```shell
# 不打印正常信息，打印错误信息（/dev/null 代表空设备）
xargs docker rmi > /dev/null
# 正常和错误信息都不打印
xargs docker rmi &> /dev/null
```

## 打印文件或文件夹列表时，排除文件或文件夹
```shell
# 排除多个文件或文件夹
ls | grep -v 'a\|b'
```
## nodejs安装
```shell
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# nvm install 14.16.0
# npm install -g nrm
# nrm ls
# nrm use taobao
# npm config ls
# rm -rf ./node_modules
# npm install
# npm run build:test

```

## docker访问权限问题
```shell
sudo groupadd docker          #添加docker用户组
sudo gpasswd -a $USER docker  #将当前用户添加至docker用户组
newgrp docker                 #更新docker用户组

```

## 查看端口占用
``` shell
# 查看53端口的占用情况
sudo netstat -anlp | grep -w LISTEN | grep 53
```

## 定义环境变量
```shell
export DOCKER_HOST=tcp://localhost:2375
```

## crontab使用
```shell
# 格式
minute   hour   day   month   week   command
# 添加任务
crontab -e
# 查看任务列表
crontab -l
# 删除任务
crontab -r
# 查看已执行过的任务
tail -f /var/log/cron
```

## 设置网络时间
```shell
# 查看当前时间
date "+%Y-%m-%d %H:%M:%S"
# 查看时区
date "+%Z"
# 使用cat /etc/sysconfig/clock查看当前时区
cat /etc/sysconfig/clock
# 设置时区
cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# 查看硬件时间
hwclock
# 同步硬件时间
hwclock -w
# 同步系统时间
clock -w

# ntpdate
# 即使是硬件时间也会和网络时间有差异，想要和网络时间完全一致，我们就需要获取网络时间更新本地时间。
# 安装工具： 
yum -y install ntp ntpdate
# 设置系统时间与网络时间同步：
ntpdate cn.pool.ntp.org
# 将系统时间写入硬件时间：
hwclock –systohc

# 同步时间服务器
ntpdate -u ntp.api.bz
# ntp常用服务器：
# 中国国家授时中心：210.72.145.44
# NTP服务器(上海) ：ntp.api.bz
# 美国： time.nist.gov
# 复旦： ntp.fudan.edu.cn
# 微软公司授时主机(美国) ：time.windows.com
# 北京邮电大学 : s1a.time.edu.cn
# 清华大学 : s1b.time.edu.cn
# 北京大学 : s1c.time.edu.cn
# 台警大授时中心(台湾)：asia.pool.ntp.org

# simple
cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
ntpdate -u ntp.api.bz
hwclock -w
```

## 查看linux系统版本

```shell
# 只适用于redhat系linux系统
cat /etc/redhat-release
```