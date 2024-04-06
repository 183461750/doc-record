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

### 通过docker使用kubectl命令

```shell
# 通过docker使用kubectl命令, 需要将kubeconfig文件挂载到容器中
# docker run --rm -it --entrypoint=kubectl kubernetes/kubectl <kubectl-commands>
docker run --rm --name kubectl -p 8081:8081 -v /etc/hosts:/etc/hosts -v ~/.kube/config:/.kube/config bitnami/kubectl:latest port-forward pods/harbor-helm-core-786c9f5db5-ddbkn 8081:8080 -n harbor6
# host模式绑定主机端口
docker run --net="host" --rm --name kubectl -v /etc/hosts:/etc/hosts -v ~/.kube/config:/.kube/config bitnami/kubectl:latest port-forward pods/harbor-helm-core-786c9f5db5-ddbkn 8081:8080 -n harbor6
# 还可以通过设置别名的方式
alias kubectl='docker run --rm --name kubectl -v /etc/hosts:/etc/hosts -v ~/.kube/config:/.kube/config bitnami/kubectl:latest'
alias kubectl='docker run --net="host" --rm --name kubectl -v /etc/hosts:/etc/hosts -v ~/.kube/config:/.kube/config bitnami/kubectl:latest'
# 或者通过sudo docker run的方式, 获得权限(用于映射像80:8080这样的需要权限的端口)
alias kubectl='sudo docker run --user=root --net="host" --rm  --entrypoint="kubectl" --name kubectl -v /etc/hosts:/etc/hosts -v ~/.kube/config:/.kube/config bitnami/kubectl:latest'

kubectl port-forward pods/harbor-helm-core-786c9f5db5-ddbkn 8081:8080 -n harbor6
```
