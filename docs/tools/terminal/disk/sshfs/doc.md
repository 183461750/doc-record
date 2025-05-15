# sshfs使用记录

## 使用

```bash
# 挂载
sshfs xx@xx.intranet:/data/nfs_share/dev /Users/xx/mount/sshfs/xx.intranet
# 如果挂载失败，可以查看系统日志：
log show --predicate 'process == "mount_nfs"' --info --last 1m
# 或
cat /var/log/system.log | grep mount_nfs

# 卸载
fusermount -u /path/to/mountpoint
umount /path/to/mountpoint
# 强制卸载（如果普通方法无效）使用 fusermount -uz（懒卸载）
fusermount -uz /path/to/mountpoint
# 使用 umount -l（懒卸载）
umount -l /path/to/mountpoint
# 检查是否卸载成功
mount | grep sshfs

# 其他方式(umount(/path/to/mountpoint): Resource busy -- try 'diskutil unmount')
diskutil unmount /path/to/mountpoint
```

- 其他参数

```bash
# 后台运行
sshfs -f [user@]host:[dir] mountpoint
# 自动重连
sshfs -o reconnect [user@]host:[dir] mountpoint
# 延迟连接
sshfs -o delay_connect [user@]host:[dir] mountpoint
# 同步写入
sshfs -o sshfs_sync [user@]host:[dir] mountpoint
# 缓存设置
sshfs -o cache=yes -o kernel_cache -o auto_cache [user@]host:[dir] mountpoint
# 用户/组映射(-o idmap=user 确保只有当前用户的 UID/GID 被映射，适合单用户环境。)
sshfs -o idmap=user [user@]host:[dir] mountpoint
# 允许其他用户访问(-o allow_other 允许其他用户访问挂载的文件系统，但需要 root 权限，并且需要在 /etc/fuse.conf 中启用 user_allow_other。)
sshfs -o allow_other [user@]host:[dir] mountpoint
# SSH 配置(-F 选项可以指定自定义的 SSH 配置文件，方便管理 SSH 连接参数。)
sshfs -F /path/to/ssh_config [user@]host:[dir] mountpoint
# 最大连接数(-o max_conns=4 可以设置最大并行 SSH 连接数，适合高并发场景。)
sshfs -o max_conns=4 [user@]host:[dir] mountpoint
# 端口指定(-p 2222 指定 SSH 端口为 2222，适合非默认端口的情况。)
sshfs -p 2222 [user@]host:[dir] mountpoint

```

- 示例

```bash
sshfs -f -o reconnect -o cache=yes -o kernel_cache -o auto_cache  -o max_conns=4 example.com:/home/user/data /mnt/remote_data
```
