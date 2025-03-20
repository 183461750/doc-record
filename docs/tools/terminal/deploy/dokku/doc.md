# dokku

感觉不是那么好用的样子，不过还是记录一下

[github地址](https://github.com/dokku/dokku)

## 安装

```bash
# download the installation script
wget -NP . https://dokku.com/bootstrap.sh
# run the installer
sudo DOKKU_TAG=v0.35.16 bash bootstrap.sh
# Configure your server domain
dokku domains:set-global dokku.me
# and your ssh key to the dokku user
PUBLIC_KEY="your-public-key-contents-here"
echo "$PUBLIC_KEY" | dokku ssh-keys:add admin
# create your first app and you're off!
dokku apps:create test-app
```

- docker版安装

[参考地址](https://dokku.com/docs/getting-started/install/docker/)

```bash
docker container run -d \
  --env DOKKU_HOSTNAME=dokku.me \
  --env DOKKU_HOST_ROOT=/var/lib/dokku/home/dokku \
  --env DOKKU_LIB_HOST_ROOT=/var/lib/dokku/var/lib/dokku \
  --name dokku \
  --publish 3022:22 \
  --publish 8080:80 \
  --publish 8443:443 \
  --volume /var/lib/dokku:/mnt/dokku \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  dokku/dokku:0.35.16
```

- docker-compose版安装

[参考地址](https://dokku.com/docs/getting-started/install/docker/)

## ssh连接

[参考地址](https://dokku.com/docs/getting-started/install/docker/)

```bash
docker exec -it dokku bash
echo "$CONTENTS_OF_YOUR_PUBLIC_SSH_KEY_HERE" | dokku ssh-keys:add KEY_NAME

# Host dokku.docker
#   HostName 127.0.0.1
#   Port 3022
```

## 使用

```bash
# 创建应用
dokku apps:create my-first-app 
# 查看信息
dokku apps:report my-first-app
# 部署
dokku git:sync --build my-first-app https://github.com/dokku/smoke-test-app.git 
# 扩容
dokku ps:scale my-first-app web=2
```
