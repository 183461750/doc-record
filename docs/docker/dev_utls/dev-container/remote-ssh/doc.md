# cpolar+ssh+docker打通受限网络

目的: 解决客户环境只能使用jumpserver连接的限制
通过启动一个docker容器即可解决

- 查看日志

```bash
journalctl -u cpolar-wrapper.service
```
