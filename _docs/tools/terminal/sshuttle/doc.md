# sshuttle

[github地址](https://github.com/sshuttle/sshuttle)

```bash
sshuttle -r root@10.0.1.90 --python $(which python3) 0.0.0.0/0

# 成功命令(--python指定的是服务端的python命令, 在服务端安装了python3)
sshuttle -r root@container2222.fa.intranet.company --python /usr/bin/python3 0.0.0.0/0
# 简化版
sshuttle -r container2222.fa.intranet.company 0.0.0.0/0

# 通过内部mac服务器访问网络, mac中连接了其他公司内部VPN, 一下命令实现让本机也能访问受VPN限制的网络
sshuttle -r mac.intranet.company 0.0.0.0/0
# 可以指定代理的域名
sshuttle -r mac.intranet.company baidu.com
```
