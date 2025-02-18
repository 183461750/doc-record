# headscale使用记录

[参考文章](https://icloudnative.io/posts/how-to-set-up-or-migrate-headscale/#headscale-%E6%98%AF%E4%BB%80%E4%B9%88)

## 安装

[docker版](https://github.com/juanfont/headscale/blob/main/docs/setup/install/container.md)

```bash
# 安装
cd ./headscale

docker run \
  --name headscale \
  --detach \
  --volume $(pwd)/config:/etc/headscale/ \
  --publish 127.0.0.1:8080:8080 \
  --publish 127.0.0.1:9090:9090 \
  headscale/headscale:<VERSION> \
  serve

# 或者使用docker-compose
docker-compose up -d

# 验证
curl http://127.0.0.1:9999/metrics

# 

# 创建默认用户
headscale user create default
# 查看用户列表
headscale user list

# 创建 API Key：
headscale apikey create
# 将 Headscale 公网域名和 API Key 填入 Headscale-Admin 的设置页面(https://headscale-xxx.sealosbja.site/admin/)，同时取消勾选 Legacy API，然后点击「Save」：
# 接入成功后，点击左边侧栏的「Users」，然后点击「Create」开始创建用户：

# 安装客户端
## Linux
curl -fsSL https://tailscale.com/install.sh | sh

# Tailscale 接入 Headscale：
# 将 <HEADSCALE_PUB_ENDPOINT> 换成上文提到的 Sealos 中的 Headscale 公网域名
tailscale up --login-server=https://<HEADSCALE_PUB_ENDPOINT> --accept-routes=true --accept-dns=false
# 会打印出注册key(mkey:xxx), 需要到Headscale-Admin的[Machines]页面[Add Device][Register Machine Key]，选择上面创建的用户并将注册key填入, 点击[Register]后, 客户端控制台会打印Success.

# 回到 Tailscale 客户端所在的 Linux 主机，可以看到 Tailscale 会自动创建相关的路由表和 iptables 规则。路由表可通过以下命令查看：
ip route show table 52
# 查看 iptables 规则：
iptables -S
iptables -S -t nat

## macOS
# 安装完 GUI 版应用后还需要做一些骚操作，才能让 Tailscale 使用 Headscale 作为控制服务器。当然，Headscale 已经给我们提供了详细的操作步骤，你只需要在浏览器中打开 URL：https://<HEADSCALE_PUB_ENDPOINT>/apple，便会出现如下的界面：

# 长按「option」键，然后点击顶部菜单栏的 Tailscale 图标，然后将鼠标指针悬停在「Debug」菜单上。
# 在「Custom Login Server」下方选择「Add Account…」。
# 在打开的弹窗中填入 Headscale 的公网域名，然后点击「Add Account」。
# 然后立马就会跳转到浏览器并打开一个页面
# 接下来与之前 Linux 客户端相同，回到 Headscale 所在的机器执行浏览器中的命令即可，注册成功：

# 回到 Headscale 所在主机，查看注册的节点：
headscale nodes list

# 回到 macOS，测试是否能 ping 通对端节点：
ping -c 2 100.64.0.1
# 在[sitting]中安装[CLl integration]后, 也可以使用 Tailscale CLI 来测试：
tailscale ping 100.64.0.1

```

### 通过 Pre-Authkeys 接入

```bash

# 前面的接入方法都需要服务端同意，步骤比较烦琐，其实还有更简单的方法，可以直接接入，不需要服务端同意。
# 首先在服务端生成 pre-authkey 的 token，有效期可以设置为 24 小时：
headscale preauthkeys create -e 24h --user default
# 查看已经生成的 key：
headscale --user default preauthkeys list
# 当然你也可以在 Headscale-Admin 中生成。点击客户端想加入的 User：
# 在弹出的界面中点击「PreAuth Keys」右侧的 Create，设置一个过期时间（比如 100 年~），如果想重复利用这个 Key，可以勾选 Reusable，最后点击 ✅：
# 创建成功后，点击红框区域便可复制该 PreAuth Key：
# 现在新节点就可以无需服务端同意直接接入了：
tailscale up --login-server=http://<HEADSCALE_PUB_ENDPOINT>:8080 --accept-routes=true --accept-dns=false --authkey $KEY

```

## 打通局域网

[参考文档](https://icloudnative.io/posts/how-to-set-up-or-migrate-headscale/#%E6%89%93%E9%80%9A%E5%B1%80%E5%9F%9F%E7%BD%91)

```bash
# 配置方法很简单，首先需要设置 IPv4 与 IPv6 路由转发：
echo 'net.ipv4.ip_forward = 1' | tee /etc/sysctl.d/ipforwarding.conf
echo 'net.ipv6.conf.all.forwarding = 1' | tee -a /etc/sysctl.d/ipforwarding.conf
sysctl -p /etc/sysctl.d/ipforwarding.conf

# 客户端修改注册节点的命令，在原来命令的基础上加上参数 --advertise-routes=192.168.100.0/24，告诉 Headscale 服务器“我这个节点可以转发这些地址的路由”。
tailscale up --login-server=http://<HEADSCALE_PUB_ENDPOINT>:8080 --accept-routes=true --accept-dns=false --advertise-routes=192.168.100.0/24 --reset

# 在 Headscale 端查看路由，可以看到相关路由是关闭的。
headscale nodes list|grep openwrt
headscale routes list -i 6
# 开启路由：
headscale routes enable -i 6 -r "192.168.100.0/24"
# 如果有多条路由需要用 , 隔开：
headscale routes enable -i 6 -r "192.168.100.0/24,xxxx"
# 也可以通过参数 -a 开启所有路由：
headscale routes enable -i 6 -a
# 其他节点查看路由结果：
ip route show table 52|grep "192.168.100.0/24"
# 其他节点启动时需要增加 --accept-routes=true 选项来声明 “我接受外部其他节点发布的路由”。

# 现在你在任何一个 Tailscale 客户端所在的节点都可以 ping 通家庭内网的机器了，你在公司或者星巴克也可以像在家里一样用同样的 IP 随意访问家中的任何一个设备，就问你香不香？
```
