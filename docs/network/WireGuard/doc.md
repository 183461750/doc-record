# WireGuard使用记录

[官网安装地址](https://www.wireguard.com/install/)

macos安装

```bash
brew install wireguard-tools
```

centos安装

```bash
# 方法一
yum install yum-utils epel-release
yum-config-manager --setopt=centosplus.includepkgs=kernel-plus --enablerepo=centosplus --save
sed -e 's/^DEFAULTKERNEL=kernel$/DEFAULTKERNEL=kernel-plus/' -i /etc/sysconfig/kernel
yum install kernel-plus wireguard-tools
reboot
# 方法二
sudo yum install epel-release elrepo-release
sudo yum install yum-plugin-elrepo
sudo yum install kmod-wireguard wireguard-tools
```
