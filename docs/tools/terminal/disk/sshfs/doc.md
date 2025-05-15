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
```
