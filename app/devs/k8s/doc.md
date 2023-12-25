# k8s相关使用记录

## k8s安装

- 通过`KuboardSpray`安装
  - [官网地址](https://kuboard-spray.cn/)

```bash
# 进入指定目录
cd /data/docker/k8s
# 快速安装
docker run -d \
  --privileged \
  --restart=unless-stopped \
  --name=kuboard-spray \
  -p 80:80/tcp \
  -e TZ=Asia/Shanghai \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ~/kuboard-spray-data:/data \
  eipwork/kuboard-spray:latest-amd64
# 在浏览器地址栏中输入 http://这台机器的IP地址，输入用户名 admin，默认密码 Kuboard123
```

## helm命令

```bash
# 安装
brew install helm
```

## kuboard可视化界面

- [也可以使用helm方式部署](./kuboard/doc.md)

```bash
# 部署
kubectl apply -f https://addons.kuboard.cn/kuboard/kuboard-v3.yaml
# 查看
kubectl get pods -n kuboard

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

## 参考链接

- [官方链接](https://kuboard.cn/install/v3/install-in-k8s.html#%E5%AE%89%E8%A3%85)
  