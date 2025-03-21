# 磁盘相关使用记录

## SFTP可以通过ssh config配置然后通过ssh连接进行自动挂载到本地磁盘吗? 

- 配置文件路径: `~/.ssh/config`

```bash
Host myserver
    HostName example.com
    User your_username
    Port 22
    IdentityFile ~/.ssh/id_rsa

```

- 使用sshfs挂载远程目录

```bash
# 在macOS上，可以使用Homebrew安装：
brew install sshfs
# 在Linux上，可以使用包管理器安装：
sudo apt install sshfs  # Debian/Ubuntu
sudo yum install sshfs  # CentOS/RHEL

# 挂载远程目录
sshfs myserver:/remote/path /local/mountpoint
```

- macos安装sshfs失败的解决方法

```bash
brew install --cask macfuse
brew install --cask sshfs-mac

```

- 自动挂载

```bash
# 使用systemd服务（Linux）
sudo nano /etc/systemd/system/mnt-myserver.service

# 添加以下内容：
[Unit]
Description=Mount remote directory via SFTP
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/sshfs myserver:/remote/path /local/mountpoint
ExecStop=/bin/fusermount -u /local/mountpoint
Restart=on-failure

[Install]
WantedBy=multi-user.target

# 启用并启动服务：
sudo systemctl daemon-reload
sudo systemctl enable mnt-myserver.service
sudo systemctl start mnt-myserver.service

```

```bash
# 使用launchd（macOS）
nano ~/Library/LaunchAgents/com.example.mountmyserver.plist

# 添加以下内容：
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.example.mountmyserver</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/sshfs</string>
        <string>myserver:/remote/path</string>
        <string>/local/mountpoint</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>

# 加载并启动服务：
launchctl load ~/Library/LaunchAgents/com.example.mountmyserver.plist

```

```bash
# 使用autossh方式

# 在macOS上，可以使用Homebrew安装：
brew install autossh
# 在Linux上，可以使用包管理器安装：
sudo apt install autossh  # Debian/Ubuntu
sudo yum install autossh  # CentOS/RHEL

# 在~/.bashrc或~/.zshrc中添加以下内容：
autossh -M 0 -f -N -o "ServerAliveInterval 30" -o "ServerAliveCountMax 3" -L 2222:localhost:22 myserver

# 使用 autossh 运行 sshfs
autossh -M 0 -o "ServerAliveInterval 60" -o "ServerAliveCountMax 3" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null your_username@example.com /usr/bin/sshfs -o allow_other,default_permissions myserver:/remote/path /local/mountpoint

# -M 0：禁用 autossh 的监控端口，使用 SSH 内置的保持连接功能。
# -o "ServerAliveInterval 60" 和 -o "ServerAliveCountMax 3"：配置 SSH 保持连接的参数。
# -o StrictHostKeyChecking=no 和 -o UserKnownHostsFile=/dev/null：简化连接（注意：在生产环境中应谨慎使用，以避免安全风险）。
# your_username@example.com：替换为您的 SSH 连接信息。
# /usr/bin/sshfs：sshfs 的路径。
# -o allow_other,default_permissions：允许其他用户访问挂载点，并应用默认权限。
# myserver:/remote/path：远程路径。
# /local/mountpoint：本地挂载点。

```

> 目前使用的方法[CloudMounter破解版](https://macwk.cn/app/1321.html)
