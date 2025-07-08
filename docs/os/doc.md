# 系统相关记录

## 一键重装系统

[GitHub地址](https://github.com/bin456789/reinstall)

```bash
# 下载脚本
curl -O https://cnb.cool/bin456789/reinstall/-/git/raw/main/reinstall.sh || wget -O reinstall.sh $_
# 重装系统
bash reinstall.sh ubuntu
# 重启
reboot
```

> PS: 重启过程中, 可能需要手动选择reinstall.sh的启动项才能正常启动重装进程, 不然, 可能会通过默认启动项进入旧系统中
