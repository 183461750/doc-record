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
#  --vfs-cache-mode writes 标志：启用 VFS 缓存模式，以提高性能和兼容性。
rclone mount alioss: ~/mount/aliyun-oss-rclone --vfs-cache-mode writes --links --log-level INFO --log-file ~/.rclone/logs/rclone.log &
#  --allow-other 标志：允许其他用户访问挂载的文件系统。请注意，这需要在 Linux 上使用 FUSE 时设置相应的权限。
rclone mount alioss: ~/mount/aliyun-oss-rclone --vfs-cache-mode writes --allow-other --links --log-level INFO --log-file ~/.rclone/logs/rclone.log &
# 2. 启用符号链接支持
# 如果你需要保留并访问 OSS 存储桶中的符号链接，可以在挂载时添加 --links 标志。这将允许 rclone 处理符号链接，但需要注意以下几点：

# 性能影响：处理符号链接可能会增加文件系统的开销，尤其是在大量符号链接存在的情况下。
# 安全性：确保符号链接不会导致安全漏洞，特别是在多用户环境中。
```

```bash
# 使用 --daemon 标志：在后台运行挂载进程
rclone mount alioss: ~/mount/aliyun-oss-rclone --vfs-cache-mode writes --daemon --allow-other --links --log-level INFO --log-file ~/.rclone/logs/rclone.log &

# --checkers 8 --transfers 16：增加并发检查器和传输数量，以提高性能。(这个配置跟CPU和带宽有关, 1 Gbps 及以上建议8 到 16, 然后 CPU8核建议8到16, 不超过16, 最后, 通常，--checkers 可以设置为 --transfers 的一半左右，以避免检查过程成为瓶颈。)
rclone mount alioss: ~/mount/aliyun-oss-rclone --daemon --allow-other --links --vfs-cache-mode writes --checkers 8 --transfers 16 --log-level INFO --log-file ~/.rclone/logs/rclone.log &
```
