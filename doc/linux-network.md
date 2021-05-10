## linux网卡的开启
```shell script
# 网络配置文件位置
cd /etc/sysconfig/network-scripts/　
# 编辑配置文件
vi ifcfg-eth0 
# ONBOOT="no"　　#默认是启动时不开启网卡，我们可以将这个设置为yes
# 然后重启网络
service network restart
```