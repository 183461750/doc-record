# frp

- 版本计划
  - --cap-add=NET_ADMIN
    - 通过这个配置缩小容器权限(只给网络相关权限)
      - 没有用这个方案了(改为使用tini作为容器初始化管理工具, 去替代systemd)

## 快速开始

[客户端docker-compose.yml](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/dev-container/remote-ssh/frp/v4/simple/docker-compose.yml)

```bash
docker compose up -d
# 或者
docker-compose up -d
```

## 更新密钥

```bash
# 将本地电脑生成的ssh公钥上传到开发跳板盒子中(~/.ssh/id_ed25519.pub)
docker exec -it dev-jumpbox bash -c "echo 'ssh-ed25519 xxx xxx' > /root/.ssh/authorized_keys"
```

## 环境变量

```bash
# 宿主机执行
export serverAddr='"129.204.8.8"'
# docker-compose.yml对应配置改为
    # environment:
    #   TZ: "Asia/Shanghai"
    #   serverAddr: ${serverAddr}
```
