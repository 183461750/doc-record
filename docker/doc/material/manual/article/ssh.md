# ssh

- [SSH 隧道简明教程](https://www.lixueduan.com/posts/linux/07-ssh-tunnel/)
  - 动态转发
    - 请求地址为192.168.1.100:3000，则通过 SSH 转发的请求地址也是192.168.1.100:3000。
    - ssh -N -D localhost:2000 root@192.168.10.85
    - 我们只需要在本地配置上 socks 代理，localhost:2000 即可把所有请求通过 ssh 2000 端口转发到 192.168.10.85 这台机器上去了。
  - 本地转发
    - 我们需要在 ServerA 上执行以下命令开启 ssh 隧道：
    - ssh -N -L 8888:192.168.10.134:8888 root@192.168.10.85
    - 执行后 serverA 上已经开始监听 8888 端口了，默认是在本地回环地址上，需要其他机器访问的话可以指定 ip 或者增加 -g 参数开启网关模式。
  