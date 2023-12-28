# 开发容器相关记录

ps: 在远程容器中进行开发，或者在本地开发在远程容器中运行和debug

## 在idea中使用

- docker compose配置调整
  - 在modify option中勾选project-name可以把相同项目名的应用放到一个compose里去
    - 生成的命令为`docker compose -f ./docker-compose.yml -p ma-compose up -d`
  
## dev container

- 解决域名无法解析的问题
  - code /etc/resolv.conf

```bash
nameserver 127.0.0.1
nameserver 127.0.0.11
nameserver 119.29.29.29
nameserver 223.5.5.5

```
