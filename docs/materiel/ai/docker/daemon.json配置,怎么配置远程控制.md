
# /etc/docker/daemon.json配置, 怎么配置远程控制

要在 Docker 中配置远程控制，你需要在 `/etc/docker/daemon.json` 文件中进行一些配置变更。这个文件用于配置 Docker 守护进程的的行为。以下是一些配置远程控制所需要设置的选项：

1. **开启远程API访问**：

   你可以通过设置 `--api-cors-header` 参数来允许跨域请求。例如，如果你想允许所有来源的跨域请求，可以设置为 `"*"`。

   ```json
   {
     "exec-opts": ["native.cgroupdriver=systemd"],
     "log-driver": "json-file",
     "log-opts": {
       "max-size": "100m"
     },
     "storage-driver": "overlay2",
     "storage-opts": [
       "overlay2.override_kernel_check=true"
     ],
     "registry-mirrors": [
       "https://registry.docker-cn.com"
     ],
     "api-cors-header": "*"
   }
   ```

2. **配置 TLS 证书**：
   如果你想通过 TLS 安全地访问 Docker API，你需要配置 TLS 证书。这通常涉及到为 Docker 守护进程和服务器端创建证书。然后，你可以在 `daemon.json` 中指定这些证书的路径。

   ```json
   {
     "exec-opts": ["native.cgroupdriver=systemd"],
     "tls-verify": "true",
     "tls-ca-cert": "/path/to/ca.pem",
     "tls-cert": "/path/to/cert.pem",
     "tls-key": "/path/to/key.pem"
   }
   ```

3. **配置监听端口**：
   默认情况下，Docker 守护进程监听本地 Unix 套接字和 TCP 端口 2375。如果你想监听不同的端口或套接字，可以设置 `debug` 和 `hosts` 选项。

   ```json
   {
     "debug": true,
     "hosts": ["tcp://0.0.0.0:2376", "unix:///var/run/docker.sock"],
     "exec-opts": ["native.cgroupdriver=systemd"],
     "log-driver": "json-file",
     "log-opts": {
       "max-size": "100m"
     },
     "storage-driver": "overlay2",
     "storage-opts": [
       "overlay2.override_kernel_check=true"
     ],
     "registry-mirrors": [
       "https://registry.docker-cn.com"
     ],
     "tls-verify": "true",
     "tls-ca-cert": "/path/to/ca.pem",
     "tls-cert": "/path/to/cert.pem",
     "tls-key": "/path/to/key.pem"
   }
   ```

请确保根据你的实际情况调整上述配置中的路径和值。在修改 `daemon.json` 文件后，需要重启 Docker 服务以使配置生效。
在 Linux 系统中，你可以使用以下命令来重启 Docker 服务：

```bash
sudo systemctl restart docker
```

如果你使用的是 Docker Desktop 版本，通常会有一个 GUI 界面来帮助你进行配置和重启操作。
