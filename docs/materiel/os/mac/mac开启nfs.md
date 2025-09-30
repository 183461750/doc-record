# mac开启nfs

在Mac上开启NFS服务，可以按照以下步骤进行：

1. **编辑NFS配置文件**：打开终端，输入`sudo vim /etc/exports`命令编辑NFS的配置文件。在文件中添加要共享的目录及相关配置，例如`/Users/xxxx/Documents -alldirs -maproot=root:wheel -network 192.168.31.0 -mask 255.255.255.0`，其中`/Users/xxxx/Documents`是想要共享的Mac端目录，`-network 192.168.31.0`指定允许访问的网络范围。
2. **检查配置文件**：添加完内容后，保存并退出编辑器。然后输入`sudo nfsd checkexports`命令，检查NFS配置是否正确。
3. **开启NFS服务**：首先禁用NFS服务，输入`sudo nfsd disable`命令；接着启用NFS服务，输入`sudo nfsd enable`命令；最后重启NFS服务，输入`sudo nfsd stop`和`sudo nfsd start`命令。
4. **检查NFS服务状态**：输入`sudo nfsd status`命令，确保NFS服务正在运行。
5. **检查NFS共享目录**：使用`showmount -e`命令，查看共享目录是否正确配置。如果命令返回了共享目录列表，说明NFS服务已经成功配置。
