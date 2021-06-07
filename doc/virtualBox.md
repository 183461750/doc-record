## VirtualBox 启动时提示“获取 VirtualBox COM 对象失败”的解决
```
https://www.cnblogs.com/imzhi/p/solution-to-the-failed-to-get-the-virtualbox-com-object.html
```
## 安装centos
```shell script
# 网络
# 启用3网卡（nat,桥接,host-only）
# 启用2网卡（桥接,host-only）
```

## 固定IP
```shell script
# 桥接网络
cd /etc/sysconfig/network-scripts/
vi ifcfg-enp0s3 

TYPE="Ethernet"
PROXY_METHOD="none"
BROWSER_ONLY="no"
# BOOTPROTO="dhcp" # 1
DEFROUTE="yes"
IPV4_FAILURE_FATAL="no"
IPV6INIT="yes"
IPV6_AUTOCONF="yes"
IPV6_DEFROUTE="yes"
IPV6_FAILURE_FATAL="no"
IPV6_ADDR_GEN_MODE="stable-privacy"
NAME="enp0s3"
UUID="ba47ac81-365b-42f7-b6a2-11b2865715ec"
DEVICE="enp0s3"
ONBOOT="yes"

BOOTPROTO="static" # 2
IPADDR="10.0.0.91" # 3
~                                                                                                                                                                                                                                                                    
# 修改 1、2、3处即可
```