# k8s容器运行时命令行工具

containerd运行时

```bash
# 列出所有容器
crictl ps
```

- 配置不安全的镜像仓库

```bash
mkdir /etc/containerd/
# 写入默认配置
containerd config default > /etc/containerd/config.toml
# 修改配置文件
# [plugins."io.containerd.grpc.v1.cri".registry]
#       [plugins."io.containerd.grpc.v1.cri".registry.mirrors]
#         [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
#           endpoint = ["https://registry-1.docker.io"]
# 添加以下内容
#         [plugins."io.containerd.grpc.v1.cri".registry.mirrors."harbor.harbor6"]
#           endpoint = ["http://harbor.harbor6"]
# 重启下
systemctl daemon-reload
systemctl restart containerd.service

```

```bash
# 带端口的配置
        [plugins."io.containerd.grpc.v1.cri".registry.mirrors."harbor.harbor6:30003"]
          endpoint = ["http://harbor.harbor6:30003"]
```
