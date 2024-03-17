# kubectl使用记录

## 初级应用

### 连接到集群

```shell
# 修改配置文件, 将集群的kubeconfig文件内容添加到文件中
code ~/.kube/config

## 查看集群上下文
kubectl config get-contexts
## 使用集群上下文
kubectl config use-context <context-name>
```

### 命令使用示例

```shell
# 创建命名空间
kubectl create namespace test
```

## 高级应用

### 连接多个集群

```yml
# 示例: 手动将下载下来的kubeconfig合并到当前配置中
apiVersion: v1
clusters:
- cluster:
    server: https://k8smanager-xxx.cn/k8s/clusters/sss
  name: aaa

- cluster:
    certificate-authority-data: ******
    server: https://apiserver.cluster.local:6443
  name: kubernetes

contexts:
- context:
    cluster: aaa
    namespace: test1
    user: aaa
  name: aaa

- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: kubernetes-admin@kubernetes

current-context: aaa
kind: Config
preferences: {}
users:
- name: aaa
  user:
    token: *****

- name: kubernetes-admin
  user:
    client-certificate-data: ****
    client-key-data: ***

```
