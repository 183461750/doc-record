# git相关使用

## git升级

- [相关链接](https://packages.endpointdev.com/)
- [相关链接](https://www.endpointdev.com/blog/2021/12/installing-git-2-on-centos-7/#:~:text=lks%20you%20step%20b)

```bash
# 检查git版本
git --version
# git version 1.8.3.1

# 查看git安装位置
which git
# /usr/bin/git

# 确保它是使用 yum 从 RPM 安装
rpm -qi git
# Name        : git
# Version     : 1.8.3.1
# Release     : 23.el7_8
# Source RPM  : git-1.8.3.1-23.el7_8.src.rpm
# Build Date  : Thu 28 May 2020 08:37:56 PM UTC
# Build Host  : x86-02.bsys.centos.org
# Packager    : CentOS BuildSystem <http://bugs.centos.org>
# Vendor      : CentOS

# 添加 End Point Yum 存储库
sudo yum install -y https://packages.endpointdev.com/rhel/7/os/x86_64/endpoint-repo.x86_64.rpm

# 安装或升级 git
sudo yum install -y git

# 如果您没有看到可用的新 git 版本，则可能需要使用以下命令清除 Yum 缓存：
sudo yum clean all


## 问题
# 如果安装不成功可尝试先卸载git(也可能不是yum安装的git，就需要其他方式卸载了)
sudo yum remove git
sudo yum remove git-*

```
