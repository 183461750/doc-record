## docker info 报warning
```shell
# WARNING: IPv4 forwarding is disabled. Networking will not work.
# 解决办法：
vi /etc/sysctl.conf
# 或者
vi /usr/lib/sysctl.d/00-system.conf
# 添加如下代码：
    net.ipv4.ip_forward=1

# 重启network服务
systemctl restart network

# 查看是否修改成功
sysctl net.ipv4.ip_forward

# 如果返回为“ net.ipv4.ip_forward = 1 ”则表示成功了
```
```shell
# 执行 docker info 时出现警告
# WARNING: bridge-nf-call-iptables is disabled
# WARNING: bridge-nf-call-ip6tables is disabled
# 解决办法：

vi /etc/sysctl.conf
# 在文件里添加下面两行代码：

net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
# 然后 ESC 退出后 :wq 保存，执行下面代码：

sysctl -p
# 再试一次 docker info 问题应该解决了
```