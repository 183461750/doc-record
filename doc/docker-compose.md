# docker-compose相关记录

## 安装或升级指定版本

```shell
# 查看之前下载的程序
ll /usr/local/bin/docker-compose
# 删除之前下载的程序
rm /usr/local/bin/docker-compose

# 下载安装程序到指定目录
# sudo curl -L https://get.daocloud.io/docker/compose/releases/download/1.26.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
sudo curl -L https://github.com/docker/compose/releases/download/v2.11.2/docker-compose-linux-x86_64 > /usr/local/bin/docker-compose

# 添加执行权限
chmod +x /usr/local/bin/docker-compose

```
