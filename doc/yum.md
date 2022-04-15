# yum相关文档

## yum源-使用阿里yum源

- [参考阿里开发者社区文章](https://developer.aliyun.com/mirror/centos)
```shell
# centos8
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
wget -O /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-vault-8.5.2111.repo
yum clean all && yum makecache

```

## EPEL到底是什么，为何经常要安装epel-release软件包
- EPEL (Extra Packages for Enterprise Linux)是基于Fedora的一个项目
- [参考阿里云开发者社区文章](https://developer.aliyun.com/mirror/epel)
``` shell
yum -y install epel-release
 
yum repolist
```
```shell
yum clean all
 
yum makecache
```
## centos7 安装epel-release rpm
```shell
Download the latest epel-release rpm from
http://dl.fedoraproject.org/pub/epel/7/，下载rpm文件

Install epel-release rpm:
# rpm -Uvh epel-release*rpm 
```
## fedora19安装后，需要安装的一些必备的软件包
``` 
# 安装rpmfusion源

# Fedora 19的源：
sudo yum localinstall --nogpgcheck http://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-19.noarch.rpm  http://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-19.noarch.rpm

# 安装一下有用的一些软件包

sudo yum -y install yum-fastestmirror unrar thunderbird emacs ibus-table \
redhat-lsb gstreamer-plugins-bad gstreamer-plugins-ugly gstreamer-ffmpeg \
compat-libstdc++-33 NetworkManager-devel python-gevent tracker-ui-tools qemu \
libpciaccess-devel xorg-x11-util-macros llvm-devel mtdev* mutt msmtp tftp \
tftp-server policycoreutils-gui mtd-utils mtd-utils-ubi vim ibus-pinyin \
gnome-tweak-tool ckermit stardict stardict-dic-zh_CN stardict-dic-en \
ibus-table-chinese-wubi-haifeng gnash smplayer vlc samba pidgin pidgin-sipe \
meld expect glibc-static ncurses-static genromfs cmake ccache p7zip nmap \
gstreamer1-plugins-bad-freeworld gstreamer1-plugins-ugly gstreamer1-libav

# 升级一下系统：

sudo yum -y update

# 参考文章
https://www.cnblogs.com/lizhi0755/p/3308936.html
```

## 向fedora添加rpmfusion源
```
# 有的rpmfusion地址有版本问题，找到一个比较好用的摘录一下：


# 从http://download1.rpmfusion.org/的free和nofree库中fedora目录下载稳定版rpmfusion-free-release-stable.noarch.rpm和rpmfusion-nonfree-release-stable.noarch.rpm， 或者直接在线安装：
rpm -Uvh http://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-stable.noarch.rpm
rpm -Uvh http://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-stable.noarch.rpm
# [stable]为版本号，无法安装的话，改成适合的版本号，例如35
```

## RPM Fusion
- 由于版权问题，许多软件在Fedora中是没有的，如果我们想安装，我们需要添加或安装库，RPM Fusion是最好的，有两个RPM Fusion提供：免费和非免费。
- 我们可以使用下面的命令安装
```
dnf install --nogpgcheck http://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-24.noarch.rpm
dnf install --nogpgcheck http://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-24.noarch.rpm
```

## 安装WINE
- wine不是一个模拟器，它是一个开放源码软件，它允许使用的用户在非Microsoft Windows中运行微软程序。我们可以通过使用以下命令安装：
```
dnf install wine
```