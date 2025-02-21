# 蒲公英vpn

[官网](https://pgy.oray.com)

```bash
# 镜像拉取
docker pull crpi-orhk6a4lutw1gb13.cn-hangzhou.personal.cr.aliyuncs.com/bestoray/pgyvpn
# 启动容器
docker run -d --device=/dev/net/tun --net=host --cap-add=NET_ADMIN --env PGY_USERNAME="xxx" --env PGY_PASSWORD="xxx" crpi-orhk6a4lutw1gb13.cn-hangzhou.personal.cr.aliyuncs.com/bestoray/pgyvpn

#二、使用说明
# 1、启动容器必须加字段 “--cap-add=NET_ADMIN” ，否则会导致虚拟网卡创建失败，从而导致组网无法正常通信
# 2、USERNAME 选项支持输入“贝锐账号 ”或”UID“
# 3、支持配合docker的-v参数使用容器卷功能
# 4、镜像中已默认安装ping、ifconfig等网络调试工具，方便用户使用
# 5、日志路径：/var/log/oray
# 6、配置路径：/etc/oray/pgyvpn
```
