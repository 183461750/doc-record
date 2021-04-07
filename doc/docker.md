## 设置docker开机自启
```shell
systemctl enable docker
```

## 配置docker镜像源
```shell
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://ipl2fa8y.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```
```shell script
# docker镜像源
https://docker.mirrors.ustc.edu.cn
```