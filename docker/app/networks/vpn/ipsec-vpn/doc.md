# ipsec-vpn

## 什么是IPsec VPN？

IPsec即Internet Protocol Security，是一种用于保护互联网协议（IP）传输数据的协议。而VPN（Virtual Private Network）则是一种基于公共网络构建的专用网络，在其中可以进行安全数据传输。IPsec VPN结合二者的优势，可以在公共网络中创建一个虚拟专用网络，实现不同地点之间的安全通信，包括远程办公、资源共享等。

## 使用Docker搭建IPsec VPN Server

### 服务端

规划vpn配置信息

- /data/jump/vpn/.env为vpn配置信息

```shell
VPN_IPSEC_PSK=password1!
# 配置用于登陆VPN的账号和密码
VPN_USER=vpn
VPN_PASSWORD=vpn1234
# 如下应该填写本机的外网IP（服务器ip）
VPN_PUBLIC_IP=36.111.179.*
# 配置额外的用户名和密码
VPN_ADDL_USERS=vpn1 vpn2
VPN_ADDL_PASSWORDS=vpn11234 pass21234
#DNS配置
VPN_DNS_SRV1=8.8.8.5
VPN_DNS_SRV2=114.114.114.114
```

启动VPN服务

```shell
docker run \ 
    --name ipsec-vpn-server \
    --env-file /data/jump/vpn/.env \ 
    --restart=always \
    -p 500:500/udp \
    -p 4500:4500/udp \
    -v /lib/modules:/lib/modules:ro \
    -d --privileged \
    hwdsl2/ipsec-vpn-server
```

查看信息

```shell
# 查看VPN连接信息
docker logs -f ipsec-vpn-server
# 查看客户端连接情况,ip分配、流量使用等
docker exec -it ipsec-vpn-server ipsec whack --trafficstatus
```

### 客户端

客户端连接VPN通用配置（手机、电脑）

```shell
#不同设备实际需要填写的信息会有略微不同，但是关键信息为以下几个配置
VPN类型：IPSec
服务器：vpn服务器的ip，不需要端口
密钥：配置信息中的IPSec PSK
用户名、密码：配置信息中的username、password
```

## 相关文章

- [一套好用的VPN](https://mp.weixin.qq.com/s/iKOaRoSwbA5Nz667uk-jRA)
- 私有文章
  - [package](https://gitee.com/LFa/doc/raw/master/me/records/soft/vpn/openVPN/pakage/doc.md)
  