# 开发容器相关记录

ps: 在远程容器中进行开发，或者在本地开发在远程容器中运行和debug

## 在idea中使用

- docker compose配置调整
  - 在modify option中勾选project-name可以把相同项目名的应用放到一个compose里去
    - 生成的命令为`docker compose -f ./docker-compose.yml -p ma-compose up -d`
      - 使用--build选项：在运行docker-compose up命令时，添加--build选项可以确保每次都重新构建镜像。
        - eg: `docker compose -f ./docker-compose.yml -p ma-compose up -d --build`
  
## dev container

- 解决域名无法解析的问题
  - code /etc/resolv.conf

```bash
nameserver 127.0.0.1
nameserver 127.0.0.11
# 以下两个配置来源于当前连接的WiFi
nameserver 119.29.29.29
nameserver 223.5.5.5

```

## docker忽略文件的使用

- 文件名:[.dockerignore]与Dockerfile文件同级

```bash
*
!dist
!wap.conf

```

## devcontainer.json的使用

- 关于"SSH_AUTH_SOCK"配置使用记录[对应的devcontainer配置](./example/.devcontainer/devcontainer.json)
  - "SSH_AUTH_SOCK": $SSH_AUTH_SOCK, // 这个配置不生效的话，看看是不是需要在`ssh config`文件（~/.ssh/config）中配置`ForwardAgent yes`才行
  