# k8s NFS 挂载

## 安装 NFS 服务端

```bash

## ubuntu服务端(250926)
# 更新软件包列表
sudo apt update
sudo apt install -y nfs-kernel-server
# 启动 NFS 服务
sudo systemctl start nfs-kernel-server
# 设置开机自启
sudo systemctl enable nfs-kernel-server
# 检查服务状态（确认是否正常运行）
sudo systemctl status nfs-kernel-server

```

## 配置 NFS 共享目录

```bash
# 创建共享目录
sudo mkdir -p /data/k8s/volume/postgresql/postgresql-data

# 编辑 exports 文件
sudo nano /etc/exports

# 添加如下配置（允许 Kubernetes 节点访问，根据实际网络调整权限）
# 172.20.0.0/16：替换为你的 Kubernetes 节点所在的 IP 段（确保包含所有需要挂载的节点）。
# rw：读写权限；sync：同步写入；no_root_squash：允许 root 用户操作（Kubernetes 通常需要此权限）。
# /data/k8s/volume/postgresql/postgresql-data  172.20.0.0/16(rw,sync,no_root_squash,no_subtree_check)
# 这里配置上节点的网段和容器网段
/data/k8s/volume/postgresql/postgresql-data  10.0.0.0/16(rw,sync,no_root_squash,no_subtree_check)  172.20.0.0/16(rw,sync,no_root_squash,no_subtree_check)

# 保存退出后，重新加载 NFS 配置
sudo exportfs -r

# 验证共享是否生效
sudo exportfs -v

```

## 测试挂载

完成上述步骤后，在需要挂载的 Kubernetes 节点上，重新尝试手动挂载测试：

```bash
# 创建临时目录
mkdir -p /tmp/test-nfs

# 手动挂载
sudo mount -t nfs master2:/data/k8s/volume/postgresql/postgresql-data /tmp/test-nfs

# 若挂载成功，可通过以下命令验证
df -h | grep /tmp/test-nfs

# 测试完成后卸载
sudo umount /tmp/test-nfs
```

如果手动挂载成功，再重启 Kubernetes Pod 即可解决 MountVolume 失败的问题：

```bash
# 删除问题 Pod（Kubernetes 会自动重建）
kubectl delete pod <pod-name> -n <namespace>
```

## 问题

Bitnami PostgreSQL 镜像默认使用 UID 1001 和 GID 1001 的非 root 用户运行（而非 root）

```bash
# 切换到 NFS 共享目录的父目录
cd /data/k8s/volume/postgresql/

# 查看当前权限（确认是 root:root）
ls -ld postgresql-data

# 修改属主和属组为 1001（Bitnami 镜像的默认用户）
sudo chown -R 1001:1001 postgresql-data/

# 设置目录权限为 700（PostgreSQL 要求数据目录权限严格，避免其他用户访问）
sudo chmod -R 700 postgresql-data/

# 确认修改结果（应显示 drwx------ 1001 1001）
ls -ld postgresql-data
```
