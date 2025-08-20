
# k8s相关使用记录

## k8s安装

### 通过`KubeKey`安装

[kubekey](https://github.com/kubesphere/kubekey)

```bash
# 	Kubernetes 版本 ≥ 1.18
# socat	必须安装
# conntrack	必须安装
# 验证: socat -V && conntrack --version
sudo apt install socat conntrack -y


# 使用脚本获取 KubeKey
export KKZONE=cn
curl -sfL https://get-kk.kubesphere.io | sh -
# 创建集群(快速开始)
export KKZONE=cn
# ./kk create cluster [--with-kubernetes version] [--with-kubesphere version]
# 使用默认版本创建一个纯 Kubernetes 集群
./kk create cluster
# 创建一个部署了 KubeSphere 的 Kubernetes 集群 （例如 --with-kubesphere v3.1.0）
./kk create cluster --with-kubesphere
# 使用配置文件创建集群
./kk create cluster -f ~/myfolder/config-sample.yaml


# Console: http://10.0.16.146:30880
# Account: admin
# Password: P@88w0rd

# Please check the result using the command:
kubectl logs -n kubesphere-system $(kubectl get pod -n kubesphere-system -l 'app in (ks-install, ks-installer)' -o jsonpath='{.items[0].metadata.name}') -f


# 删除集群
./kk delete cluster
```

#### 问题

```bash
# FATA[0000] validate service connection: validate CRI v1 image API for endpoint "unix:///run/containerd/containerd.sock": rpc error: code = Unimplemented desc = unknown service runtime.v1.ImageService: Process exited with status 1

vi /etc/containerd/config.toml

# disabled_plugins = []  # 确保未禁用 CRI
# 重启 Containerd：
sudo systemctl restart containerd

```

### 通过

### 通过`KuboardSpray`安装

[官网地址](https://kuboard-spray.cn/)

```bash
# 进入指定目录
cd /data/docker/k8s
# 快速安装
docker run -d \
  --dns=223.5.5.5 \
  --privileged \
  --restart=unless-stopped \
  --name=kuboard-spray \
  -p 80:80/tcp \
  -e TZ=Asia/Shanghai \
  -e https_proxy=http://10.0.16.17:7890 \
  -e http_proxy=http://10.0.16.17:7890 \
  -e all_proxy=socks5://10.0.16.17:7890 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ~/kuboard-spray-data:/data \
  eipwork/kuboard-spray:latest-amd64
# 在浏览器地址栏中输入 http://这台机器的IP地址，输入用户名 admin，默认密码 Kuboard123
docker run -d \
  --dns=223.5.5.5 \
  --privileged \
  --restart=unless-stopped \
  --name=kuboard-spray \
  -p 80:80/tcp \
  -e TZ=Asia/Shanghai \
  -v /var/run/docker.sock:/var/run/docker.sock \
  eipwork/kuboard-spray:latest-amd64
```

### yum安装k8s

- [文档详情地址](./docs/temp/yum安装k8s.md)(PS: AI提供的内容，还未测试过)

## helm命令

```bash
# 安装
brew install helm

# 使用

# 安装
helm install my-release skywalking -n <namespace>
# 查看列表
helm list
# 卸载
$ helm uninstall my-release -n <namespace>
```

## minikube

```bash
# 安装(需要依赖docker)
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
# 请注意，这种方法会继续以root权限运行minikube，但它可能会带来安全风险，因为"docker"驱动不应该以root权限使用。
minikube start --force
# 仪表盘
minikube dashboard
```

## kuboard可视化界面

- [也可以使用helm方式部署](./kuboard/doc.md)
- docker 方式安装

```bash
# KUBOARD_ENDPOINT="http://内网IP:80"
docker run -d \
  --restart=unless-stopped \
  --name=kuboard \
  -p 80:80/tcp \
  -p 10081:10081/tcp \
  -e KUBOARD_ENDPOINT="http://10.0.16.17:80" \
  -e KUBOARD_AGENT_SERVER_TCP_PORT="10081" \
  -v /root/kuboard-data:/data \
  eipwork/kuboard:v3
```

- kubectl 方式安装

```bash
# 部署
kubectl apply -f https://addons.kuboard.cn/kuboard/kuboard-v3.yaml
# 查看
kubectl get pods -n kuboard
# 卸载
kubectl delete -f https://addons.kuboard.cn/kuboard/kuboard-v3.yaml
  # 清理遗留数据
    # 在 master 节点以及带有 k8s.kuboard.cn/role=etcd 标签的节点上执行
rm -rf /usr/share/kuboard

---

## 常见问题
# 查看节点
kubectl get nodes
# 打标
kubectl label nodes docker-desktop k8s.kuboard.cn/role=etcd

---

## 访问 Kuboard
# 在浏览器中打开链接 http://your-node-ip-address:30080 (eg: http://localhost:30080)
# 输入初始用户名和密码，并登录
# 用户名： admin
# 密码： Kuboard123
```

### 参考链接

- [官方链接](https://kuboard.cn/install/v3/install-in-k8s.html#%E5%AE%89%E8%A3%85)
