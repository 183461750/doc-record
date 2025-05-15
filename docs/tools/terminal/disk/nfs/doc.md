# NFS使用记录

## 安装

- [macfuse官网](https://macfuse.github.io/)

```bash
# macos
# 通过上面的网站下载安装macfuse和sshfs

# centos服务端
yum install -y nfs-utils

# Ubuntu/Debian
sudo apt install -y nfs-common

# 启动并启用 NFS 服务
systemctl start nfs-server
systemctl enable nfs-server
systemctl status nfs-server

```

## 配置 NFS 共享目录

```bash
# 编辑 /etc/exports 文件
vim /etc/exports

# 示例
# 格式：共享目录 客户端IP(选项)
/data/nfs_share 192.168.1.0/24(rw,sync,no_root_squash)

# /data/nfs_share：要共享的目录（需提前创建）。
# 192.168.1.0/24：允许访问的客户端 IP 范围（* 表示所有客户端，但不推荐）。
# rw：读写权限（ro 表示只读）。
# sync：同步写入（async 表示异步，但可能丢失数据）。
# no_root_squash：允许客户端 root 用户保持 root 权限（谨慎使用，可能带来安全风险）。
# root_squash（默认）：客户端 root 用户映射为 nobody 用户。

# 创建共享目录
mkdir -p /data/nfs_share
chmod 755 /data/nfs_share
# 可选，NFS 默认用户
chown nfsnobody:nfsnobody /data/nfs_share
# 导出 NFS 共享
# 运行以下命令使配置生效：
exportfs -ra
# 查看当前共享情况：
exportfs -v
```

## 配置防火墙（如果启用）

```bash
# 如果 CentOS 启用了防火墙（firewalld），需要放行 NFS 相关端口：
sudo firewall-cmd --permanent --add-service=nfs
sudo firewall-cmd --permanent --add-service=mountd
sudo firewall-cmd --permanent --add-service=rpc-bind
sudo firewall-cmd --reload
# 或者直接放行 NFS 默认端口（不推荐，可能影响安全性）：
sudo firewall-cmd --permanent --add-port={2049/tcp,2049/udp}
sudo firewall-cmd --reload

```

## 测试 NFS 服务

```bash
# 在服务器上测试
showmount -e localhost

```

## 挂载 NFS 共享

```bash
# 确保客户端目录权限
chmod 755 /Users/xx/mount/sshfs

mount -t nfs 192.168.1.100:/data/nfs_share /mnt/nfs
# （192.168.1.100 是 NFS 服务器 IP，/mnt/nfs 是客户端挂载点）
# 使用 mount_nfs（macOS 原生命令）
sudo mount_nfs -o resvport xx.intranet.company:/data/nfs_share/dev /Users/xx/mount/sshfs/xx.intranet.company


# 检查是否挂载成功：
df -h | grep nfs
# 如果看到类似 /dev/nfs 的挂载信息，说明成功。

```

## 卸载

```bash
# /mnt/nfs 是客户端挂载点
umount /mnt/nfs
```

## 常见问题

```bash
# 客户端无法挂载

# 检查 /etc/exports 配置是否正确。
# 确保防火墙放行了 NFS 相关端口。
# 检查 rpcbind 服务是否运行（CentOS 7+ 默认启用）：
sudo systemctl status rpcbind

# 权限问题

# 确保共享目录的权限正确（chmod 755）。
# 如果使用 no_root_squash，确保客户端 root 用户有权限。
```

- macos挂载显示没权限的问题

```bash
macOS 的 NFS 服务由 launchd 管理，不能直接运行 nfsd start。你需要：
```
