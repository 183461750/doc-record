# k8s相关使用记录

## helm命令

```bash
# 安装
brew install helm
```

## kuboard可视化界面

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
  