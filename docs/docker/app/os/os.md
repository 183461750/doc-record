
# docker容器中部署系统相关文档

## win系统

- 方式一: `docker-compose.yml`方式
- 方式二: `docker run`方式
  
  ```shell
  docker run -it --rm -p 8006:8006 --device=/dev/kvm --cap-add NET_ADMIN --stop-timeout 120 dockurr/windows
  ```

- 相关文章
  - [开源地址](https://github.com/dockur/windows)

## Linux中安装可视化虚拟机

- 测试版
  
[参考文章](https://github.com/quickemu-project/quickemu/wiki/01-Installation)
[参考文章](https://mp.weixin.qq.com/s/W99irRFN5geQ5wHr2i4y2w)

```bash
# 没成功...可能系统不支持
yum install -y dnf

sudo dnf install bash coreutils curl edk2-tools genisoimage grep jq mesa-demos pciutils procps python3 qemu sed socat spice-gtk-tools swtpm unzip usbutils util-linux xdg-user-dirs xrandr zsync

git clone https://github.com/quickemu-project/quickemu.git

```
