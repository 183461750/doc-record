# cpolar使用记录

[官网](https://www.cpolar.com)

[安装文档](https://www.cpolar.com/docs)

```bash
# 安装
# mac
brew tap probezy/core && brew install cpolar

# linux
curl -L https://www.cpolar.com/static/downloads/install-release-cpolar.sh | sudo bash

# Windows
# 在官网下载下载适用于Windows平台的zip压缩包，解压后得到cpolar安装包，然后双击安装包一路默认安装即可。https://www.cpolar.com/download

# 验证
cpolar version

# 认证
cpolar authtoken xxxxxxx
# 简单穿透测试
cpolar http 8080
# 向系统添加服务
sudo systemctl enable cpolar
# 启动cpolar服务
sudo systemctl start cpolar
# 查看服务状态
sudo systemctl status cpolar
# 登录后台，查看隧道在线状态
# https://dashboard.cpolar.com/status

# 注: cpolar 卸载方法
curl -L https://www.cpolar.com/static/downloads/install-release-cpolar.sh | sudo bash -s -- --remove
# 如果第一次安装，会默认配置一个简单的样例配置文件，创建了两个样例隧道，一个web，一个ssh
# cpolar配置文件路径(linux): /usr/local/etc/cpolar/cpolar.yml
# cpolar配置文件路径(mac): /Users/fa/.cpolar/cpolar.yml

# 安装服务
sudo cpolar service install
# 启动服务
sudo cpolar service start
# cpolar service <xxx>:Valid actions: ["start" "stop" "restart" "install" "uninstall"]
# 安装完成
# 在浏览器上访问本地9200端口【 http://127.0.0.1:9200 】，使用cpolar邮箱账号登录cpolar web UI管理界面，即可开始使用cpolar。
```

## 将管理后台的端口映射到公网

```bash
# 修改配置(将website的端口由8080改为9200)
/usr/local/etc/cpolar/cpolar.yml
# 修改后重启服务
sudo cpolar service restart
# 登录后台，查看隧道地址
# https://dashboard.cpolar.com/status

# 这样就能远程管理隧道了
```
