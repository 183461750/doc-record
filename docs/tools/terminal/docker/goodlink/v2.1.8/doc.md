# goodlink使用记录(v2.1.8)

[下载地址](https://gitee.com/konyshe/goodlink/releases/download/v2.1.8/goodlink-linux-amd64-cmd.zip)

```bash
# 下载
wget https://gitee.com/konyshe/goodlink/releases/download/v2.1.8/goodlink-linux-amd64-cmd.zip
# 添加执行权限
chmod +x ./goodlink-linux-amd64-cmd
# local
./goodlink-linux-amd64-cmd --key=AIabJpEIYHMDIA6NBgOBboYJ1 --local
# remote
./goodlink-linux-amd64-cmd --key=AIabJpEIYHMDIA6NBgOBboYJ1 --remote
# remote(docker)
docker rm goodlink -f; docker run -d --name=goodlink --net=host --restart=always registry.cn-shanghai.aliyuncs.com/kony/goodlink --key=AIabJpEIYHMDIA6NBgOBboYJ1 --remote

```

```bash

services:
  dev-jumpbox:
    image: registry.cn-shanghai.aliyuncs.com/kony/goodlink
    container_name: goodlink
    # network_mode: host
    command: ./goodlink --key=AIabJpEIYHMDIA6NBgOBboYJ1 --remote
    environment:
      TZ: "Asia/Shanghai"
    extra_hosts:
      - "me.host:host-gateway"
    restart: unless-stopped

```
