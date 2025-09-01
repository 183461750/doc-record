# 部署k8s高可用集群

（生产和测试可用）

# 环境配置：

略

# 安装前准备

## 添加hosts配置

```bash
# echo '192.168.50.7 k8s-master01' >> /etc/hosts
# echo '192.168.50.19 k8s-master02' >> /etc/hosts
# echo '192.168.50.21 k8s-master03' >> /etc/hosts
# echo '192.168.50.8 k8s-node01' >> /etc/hosts
# echo '192.168.50.14 k8s-node02' >> /etc/hosts
# echo '192.168.50.17 k8s-node03' >> /etc/hosts
# echo '192.168.50.18 db_server' >> /etc/hosts
# echo '192.168.50.20 middleware_server' >> /etc/hosts
```

## 实现免密钥登录

### 安装sshpass

```bash
# yum install -y sshpass
```

### 生成密钥

```bash
# ssh-keygen 
```

### 分发公钥

```bash
# vim sendkey.sh
#!/bin/bash
IP="
k8s-master01
k8s-master02
k8s-master03
k8s-node01
k8s-node02
k8s-node03
db_server
middleware_server
"
for node in ${IP};do
  sshpass -p abc1234 ssh-copy-id -o StrictHostKeyChecking=no ${node}
  echo "${node} 秘钥发送完成"
  scp /etc/hosts ${node}:/etc/hosts
  echo "${node} hosts文件发送完成"
done
```

### 添加执行权限

```bash
# chmod +x sendkey.sh
```

### 执行脚本

```bash
# ./sendkey.sh
```

### 验证是否能免密钥登录

```bash
# ssh k8s-master01
```

## 关闭swap（可选）

### 添加脚本

```bash
# vim close-swap.sh
#!/bin/bash
IP="
k8s-master01
k8s-master02
k8s-master03
k8s-node01
k8s-node02
k8s-node03
"
for node in ${IP};do
    ssh ${node} "swapoff -a"
    ssh ${node} "cp /etc/fstab /etc/fstab.backup"
    ssh ${node} "sed -ri 's/.*swap.*/#&/' /etc/fstab"
done
```

### 添加执行权限

```bash
# chmod +x close-swap.sh
```

### 执行脚本

```bash
# ./close-swap.sh
```

### 检查是否有关闭

```bash
# ssh k8s-master01 "free -h"
```

## 内核参数优化

## 添加配置

```bash
# vim k8s.conf
# https://github.com/moby/moby/issues/31208 
# ipvsadm -l --timout
# 修复ipvs模式下长连接timeout问题 小于900即可
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 30
net.ipv4.tcp_keepalive_probes = 10
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.lo.disable_ipv6 = 1
net.ipv4.neigh.default.gc_stale_time = 120
net.ipv4.conf.all.rp_filter = 0
net.ipv4.conf.default.rp_filter = 0
net.ipv4.conf.default.arp_announce = 2
net.ipv4.conf.lo.arp_announce = 2
net.ipv4.conf.all.arp_announce = 2
net.ipv4.ip_forward = 1
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_tw_recycle = 1
net.ipv4.tcp_max_tw_buckets = 5000
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 1024
net.ipv4.tcp_synack_retries = 2
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.netfilter.nf_conntrack_max = 2310720
fs.inotify.max_user_watches=89100
fs.may_detach_mounts = 1
fs.file-max = 52706963
fs.nr_open = 52706963
net.bridge.bridge-nf-call-arptables = 1
vm.swappiness = 0
vm.overcommit_memory=1
vm.panic_on_oom=0
#用于解决k8s内核软锁的bug
kernel.softlockup_panic = 1
kernel.softlockup_all_cpu_backtrace = 1
```

### 添加脚本

```bash
# vim send_k8sconfig.sh
#!/bin/bash
IP="
k8s-master01
k8s-master02
k8s-master03
k8s-node01
k8s-node02
k8s-node03
"
for node in ${IP};do
    scp k8s.conf ${node}:/etc/sysctl.d/k8s.conf
    ssh ${node} "sysctl --system"
done
```

### 添加执行权限

```bash
# chmod +x send_k8sconfig.sh
```

### 执行脚本

```bash
# ./send_k8sconfig.sh
```

## 磁盘挂载

略

# 安装kubeasz

介绍略......

## 设置版本kubeasz版本

```bash
export release=3.6.7
```

## 下载安装工具

```bash
wget https://githubfast.com/easzlab/kubeasz/releases/download/${release}/ezdown
```

## 添加执行权限

```bash
chmod +x ezdown
```

## 下载kubeasz安装工具

### 下载安装工具

```bash
./ezdown -D
```

# 部署k8s集群

## 容器化运行kubeasz

```bash
./ezdown -S
```

## 创建k8s集群

```bash
docker exec -it kubeasz ezctl new k8s-batar
```

## 修改hosts文件

```yaml
vim /etc/kubeasz/clusters/k8s-batar/hosts
# PS: 改IP就好了(改成域名可能有问题)
# 'etcd' cluster should have odd member(s) (1,3,5,...)
[etcd]
192.168.50.7
192.168.50.19
192.168.50.21

# master node(s), set unique 'k8s_nodename' for each node
# CAUTION: 'k8s_nodename' must consist of lower case alphanumeric characters, '-' or '.',
# and must start and end with an alphanumeric character
[kube_master]
192.168.50.7 k8s_nodename='master-01'
192.168.50.19 k8s_nodename='master-02'
192.168.50.21 k8s_nodename='master-03'

# work node(s), set unique 'k8s_nodename' for each node
# CAUTION: 'k8s_nodename' must consist of lower case alphanumeric characters, '-' or '.',
# and must start and end with an alphanumeric character
[kube_node]
192.168.50.8 k8s_nodename='worker-01'
192.168.50.14 k8s_nodename='worker-02'
192.168.50.17 k8s_nodename='worker-03'

省略...
```

## 查看alias

```bash
alias
```

查看alias是否有“dk”这个命令

部署k8s

```bash
dk ezctl setup k8s-batar all
```

查看节点信息

```bash
kubectl get node
```

查看所有pod的信息

```bash
kubectl get pods -A
```
