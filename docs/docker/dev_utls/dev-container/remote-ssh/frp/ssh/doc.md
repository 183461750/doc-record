# ssh+docker打通受限网络

[官网文档(SSH Tunnel Gateway)](https://gofrp.org/zh-cn/docs/features/common/ssh/)

- 测试版(有点问题)

```bash
# 不挂载外部文件的情况下, 在容器中执行以下命令

# 这个是让我们本地电脑能够使用ssh连接容器的ssh公钥(示例由本地机器生成即可`id_ed25519_iu`)
echo 'ssh-ed25519 xxx iu' > /root/.ssh/authorized_keys

# 这个是容器通过ssh -R访问frps服务端,实现内网穿透所需要的密钥(示例由服务端生成, 客户端生成也可以(客户端生成就需要将))
cat > /root/.ssh/id_ed25519_frp << EOF
-----BEGIN OPENSSH PRIVATE KEY-----
xxxxxx
xxx
-----END OPENSSH PRIVATE KEY-----
EOF
```
