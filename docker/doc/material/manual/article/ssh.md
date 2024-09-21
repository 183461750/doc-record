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

- socks5 代理

- [参考文章](https://wlwang41.github.io/content/ops/ssh%E9%9A%A7%E9%81%93%E4%BB%A3%E7%90%86.html)
- [参考文章1](https://blog.bug-maker.com/archives/47.html)
- [参考文章2](https://www.cnblogs.com/memphise/articles/6420019.html)
  - 可以使用一个叫做Sockscap的软件，把应用扔进去就能以代理的方式上网了。（部分需要调用多个进程的应用可能不行）
  - 如果你想把socks代理转换成http代理，可以用privoxy这个东东。

```bash
# 上传密钥~/.ssh/id_ed25519_ljf
chmod 400 ~/.ssh/id_ed25519_ljf

# ~/.ssh/config
Host mac.intranet.company
  HostName 10.0.1.251
  User ssy
  IdentityFile ~/.ssh/id_ed25519_ljf
  # PasswordAuthentication 123456

# ssh mac.intranet.company 看是否联通
```

```bash
# 登录服务器10.0.1.233
# 后台启动ssh动态转发
ssh -o GatewayPorts=yes -D 2000 mac.intranet.company -NTfCg

# 在本机中配置socks代理, 网络流量则会通过ssh转发到服务器上, 然后在访问互联网
# 配置地址: 10.0.1.233:2000
```
