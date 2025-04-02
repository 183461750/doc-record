# rclone使用记录

[官网](https://rclone.org/)

## 1. 安装

```bash
# 安装 rclone
sudo -v ; curl https://rclone.org/install.sh | sudo bash
# 配置
rclone config
# GUI(https://rclone.org/gui/)
rclone rcd --rc-web-gui

# 远程挂载
mkdir -p ~/mount/aliyun-oss-rclone
rclone mount alioss: ~/mount/aliyun-oss-rclone --vfs-cache-mode writes &
```

- 高级

```bash

# 创建挂载点目录（如果尚未创建）
mkdir -p ~/mount/aliyun-oss-rclone ~/.rclone/logs

# 使用 --no-check-links 标志（某些 rclone 版本支持）：忽略符号链接（推荐）
rclone mount alioss: ~/mount/aliyun-oss-rclone --vfs-cache-mode writes --no-check-links &

# 挂载阿里云 OSS 并启用符号链接支持
rclone mount alioss: ~/mount/aliyun-oss-rclone --vfs-cache-mode writes --links --log-level INFO --log-file ~/.rclone/logs/rclone.log &
# 2. 启用符号链接支持
# 如果你需要保留并访问 OSS 存储桶中的符号链接，可以在挂载时添加 --links 标志。这将允许 rclone 处理符号链接，但需要注意以下几点：

# 性能影响：处理符号链接可能会增加文件系统的开销，尤其是在大量符号链接存在的情况下。
# 安全性：确保符号链接不会导致安全漏洞，特别是在多用户环境中。
```
