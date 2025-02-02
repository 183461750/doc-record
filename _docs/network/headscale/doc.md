# headscale使用记录

[参考文章](https://icloudnative.io/posts/how-to-set-up-or-migrate-headscale/#headscale-%E6%98%AF%E4%BB%80%E4%B9%88)

## 安装

[sealos一键部署](https://bja.sealos.run/?openapp=system-template%3FtemplateName%3Dheadscale)

```bash
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
