# sshuttle

[github地址](https://github.com/sshuttle/sshuttle)

```bash
# 本地安装
brew install sshuttle

# 本地执行命令, 将10.0.1.0/24流量代理到服务器中去
sshuttle --sudoers-user fa -r jump.local.container2222-sshuttle.fa.intranet.company 10.0.1.0/24
```
