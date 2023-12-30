在CentOS上安装Kubernetes（k8s）需要执行以下步骤：

1. 准备：
   - 关闭防火墙：在每个节点上禁用防火墙，可以使用以下命令停止和禁用防火墙：
     ```
     systemctl stop firewalld
     systemctl disable firewalld
     ```
   - 禁用SELINUX：在每个节点上禁用SELINUX，可以使用以下命令临时禁用SELINUX：
     ```
     setenforce 0
     ```
     若要永久禁用SELINUX，可以编辑`/etc/selinux/config`文件并将`SELINUX=disabled`设置为禁用状态。

2. 安装Docker：Kubernetes依赖于Docker来运行容器。可以使用以下命令在每个节点上安装Docker：
   ````
   yum install -y docker
   systemctl start docker
   systemctl enable docker
   ```

3. 安装Kubernetes：
   - 添加Kubernetes的yum源：可以使用以下命令添加Kubernetes的yum源：
     ```
     cat <<EOF > /etc/yum.repos.d/kubernetes.repo
     [kubernetes]
     name=Kubernetes
     baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-\$basearch
     enabled=1
     gpgcheck=1
     repo_gpgcheck=1
     gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
     exclude=kube*
     EOF
     ```
   - 安装Kubernetes组件：可以使用以下命令安装Kubernetes组件：
     ```
     yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
     systemctl enable kubelet
     systemctl start kubelet
     ```

4. 初始化Kubernetes集群：在主节点上执行以下命令来初始化Kubernetes集群：
   ````
   kubeadm init
   ```
   初始化完成后，会输出一些配置信息和加入集群的命令。请保存这些信息，后续会用到。

5. 加入节点：在每个工作节点上执行初始化时输出的加入集群的命令，例如：
   ````
   kubeadm join <master-ip>:<master-port> --token <token> --discovery-token-ca-cert-hash <hash>
   ```
   其中，`<master-ip>`是主节点的IP地址，`<master-port>`是主节点的端口，`<token>`和`<hash>`是初始化时输出的token和hash。

6. 配置kubectl：在主节点上执行以下命令来配置kubectl：
   ````
   mkdir -p $HOME/.kube
   sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
   sudo chown $(id -u):$(id -g) $HOME/.kube/config
   ```

7. 安装网络插件：Kubernetes需要网络插件来实现容器之间的通信。可以选择安装Calico、Flannel等网络插件，具体安装方法可以参考官方文档或相关教程。

至此，你已经成功在CentOS上安装了Kubernetes集群。

---
Learn more:
1. [Centos7 安装部署Kubernetes(k8s)集群 - 人生的哲理 - 博客园](https://www.cnblogs.com/renshengdezheli/p/16686769.html)
2. [CentOS7中用kubeadm安装Kubernetes-阿里云开发者社区](https://developer.aliyun.com/article/626118)
3. [Centos安装部署Kubernetes（K8s）_centos部署k8s-CSDN博客](https://blog.csdn.net/rockstics/article/details/110850423)
