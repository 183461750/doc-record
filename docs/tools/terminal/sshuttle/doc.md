# sshuttle

[github地址](https://github.com/sshuttle/sshuttle)

```bash
# 本地安装
brew install sshuttle

# 本地执行命令, 将10.0.1.0/24流量代理到服务器中去
sshuttle --sudoers-user fa -r jump.local.container2222-sshuttle.fa.intranet.company 10.0.1.0/24
```

- 其他高级自动配置参数

```bash
# --dns 捕获本地 DNS 请求并转发到远程 DNS 服务器
sshuttle --sudoers-user fa -r mac.intranet.company 10.0.10.0/24 --dns --method auto
# --auto-hosts 持续扫描远程主机名并在发现时更新本地 /etc/hosts 文件。
# --auto-nets 自动确定路由子网
sshuttle --sudoers-user fa -r mac.intranet.company 10.0.10.0/24 --dns --method auto --auto-hosts --auto-nets
# -D后台运行
sshuttle --sudoers-user fa -r mac.intranet.company 10.0.10.0/24 --dns --method auto --auto-hosts --auto-nets -D
```

- 最佳实践

```bash
# 只添加必要配置, 其他均用默认值就好
sshuttle --dns --auto-hosts --auto-nets -D -r mac.intranet.company 10.0.10.0/24
```
