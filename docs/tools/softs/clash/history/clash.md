
# linux中使用clash记录

## 安装clash-for-linux

- clash文件目录[内网服务器路径备忘](/root/vpn)
  - [本地备份文件](clash-linux-amd64-v1.18.0.gz)，解压命令`gzip -d clash-linux-amd64-v1.18.0.gz`
- 补充参考链接(以前的链接不知道哪去了，新找了些补充下)
  - [clash-for-linux](https://github.com/ghostxu97/clash-for-linux)
  - [clash-for-linux](https://blog.iswiftai.com/posts/clash-linux/)

## 添加config.yaml配置文件

在clash同级目录中添加config.yaml文件

文件来源:
    - 本地客户端
      - 设置 -> 配置 -> 打开配置文件夹 - 有效的config.yaml(找到后放到服务器中的clash所在目录即可)

## 启动命令

```shell
# 重命名
mv clash-linux-amd64-v1.18.0 clash
# vim start.sh
cd /root/vpn
nohup ./clash -d . &
```

- 环境变量配置(用于开启系统代理)

```shell
# vim .env
# 设置系统代理
export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890
# 取消系统代理
unset  http_proxy  https_proxy  all_proxy
```

> 到这已经已经能访问外网了

## DashBoard 外部控制（可视化界面远程管理服务器中的clash配置）

> 前提条件: 本地电脑中有安装可视化界面的clash客户端

PS：只使用默认配置的话，这步不需要操作

```bash
# 修改 /etc/clash/config.yaml 文件部分配置：
mixed-port: 12345
authentication:
  - "用户名1:密码1"
  - "用户名2:密码2"
allow-lan: true
mode: Rule
log-level: info
external-controller: :9090

# 对应开启系统代理的方式调整
export https_proxy=http://用户名1:密码1@127.0.0.1:12345 http_proxy=http://用户名1:密码1@127.0.0.1:12345 all_proxy=socks5://用户名1:密码1@127.0.0.1:12345

# config.yaml中的这个配置为DashBoard的外部控制端口
external-controller: :9090
# 自己本地电脑中安装的clash可在设置中的配置界面找到远程控制器管理界面，在其中添加对应的api url（http://ip:9090）进行远程控制
