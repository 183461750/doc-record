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
## 设置防火墙
```shell script
systemctl disable firewalld.service
systemctl stop firewalld.service
```
## 安装docker并配置加速器
```shell script
yum -y install docker
```
## 修改主机名
```shell script
hostnamectl set-hostname manager43
```