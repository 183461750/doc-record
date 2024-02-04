# docker容器中部署系统相关文档

## win系统

- 方式一: `docker-compose.yml`方式
- 方式二: `docker run`方式
  
  ```shell
  docker run -it --rm -p 8006:8006 --device=/dev/kvm --cap-add NET_ADMIN --stop-timeout 120 dockurr/windows
  ```

- 相关文章
  - [开源地址](https://github.com/dockur/windows)
  