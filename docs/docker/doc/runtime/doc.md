# docker运行时相关记录

## kata-containers

### temp

```bash
# 不太行
mkdir -p /root/kata-container/kata-rpm
curl -OL https://github.com/kata-containers/kata-containers/releases/download/3.18.0/kata-containers-3.18.0-vendor.tar.gz
# 解压
tar -xvf kata-containers-3.18.0-vendor.tar.gz -C /root/kata-container/kata-rpm
# yum安装yq
yum install -y yq
```
