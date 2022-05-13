# docker笔记

## 安装docker

```shell
# 使用官方安装脚本自动安装
curl -fsSL https://get.docker.com | bash -s docker --mirror aliyun
# 使用国内 daocloud 一键安装命令
curl -sSL https://get.daocloud.io/docker | sh
```

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

## 部署

```shell script
# 对性能要求高 用 --net=host(对应docker-stack.yml文件下的(service.serviceName.network_mode=host)network_mode: "host") ， 不用-p
# 参考网上的测试：上次对对使用Docker的两台Redis做压力测试，A台使用-p，B台使用--net=host。但是发现A的效率只有B的1/3-2/3 ，这么大的性能影响，-p应该不适合生产环境吧？望大师们指教。谢谢。
```

## 删除空镜像

```shell script
sudo docker images | awk '{if($2=="<none>") print $3}' | xargs sudo docker rmi

# 您需要先停止运行容器然后将其删除
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
# 对于图像，请尝试删除悬空图像
docker rmi $(docker images -f dangling=true -q)
# 删除所有未被使用的镜像
docker image prune  -a 
```

## 找镜像的地址

  https://hub.docker.com/

## 修改宿主机的docker配置，让其可以远程访问

```shell
# 默认,我们的linux的 docker ,IDEA 是不可以访问的,所以需要修改下配置,让我们的IDEA 可以访问
vi /lib/systemd/system/docker.service
# 在 其中的ExecStart=后添加配置 > tip: 2375是为Docker开启的远程访问API的端口
-H tcp://0.0.0.0:2375 -H unix:///var/run/docker.sock

# 刷新配置，重启服务
systemctl daemon‐reload  # 刷新服务
systemctl restart docker # 重新启动docker
docker start registry  # 启动registry

```

## docker compose文件root用户权限控制

```yaml
containers:
      - name: snake
        image: docker.io/kelysa/snake:lastest
        imagePullPolicy: Always
        securityContext:
          privileged: true
          capabilities:
            add: ["NET_ADMIN","NET_RAW"]
            
# Linux capabilities
#  在linux中，root权限被分割成一下29中能力：
#
#  CAP_CHOWN:修改文件属主的权限
#
#  CAP_DAC_OVERRIDE:忽略文件的DAC访问限制
#
#  CAP_DAC_READ_SEARCH:忽略文件读及目录搜索的DAC访问限制
#
#  CAP_FOWNER：忽略文件属主ID必须和进程用户ID相匹配的限制
#
#  CAP_FSETID:允许设置文件的setuid位
#
#  CAP_KILL:允许对不属于自己的进程发送信号
#
#  CAP_SETGID:允许改变进程的组ID
#
#  CAP_SETUID:允许改变进程的用户ID
#
#  CAP_SETPCAP:允许向其他进程转移能力以及删除其他进程的能力
#
#  CAP_LINUX_IMMUTABLE:允许修改文件的IMMUTABLE和APPEND属性标志
#
#  CAP_NET_BIND_SERVICE:允许绑定到小于1024的端口
#
#  CAP_NET_BROADCAST:允许网络广播和多播访问
#
#  CAP_NET_ADMIN:允许执行网络管理任务
#
#  CAP_NET_RAW:允许使用原始套接字
#
#  CAP_IPC_LOCK:允许锁定共享内存片段
#
#  CAP_IPC_OWNER:忽略IPC所有权检查
#
#  CAP_SYS_MODULE:允许插入和删除内核模块
#
#  CAP_SYS_RAWIO:允许直接访问/devport,/dev/mem,/dev/kmem及原始块设备
#
#  CAP_SYS_CHROOT:允许使用chroot()系统调用
#
#  CAP_SYS_PTRACE:允许跟踪任何进程
#
#  CAP_SYS_PACCT:允许执行进程的BSD式审计
#
#  CAP_SYS_ADMIN:允许执行系统管理任务，如加载或卸载文件系统、设置磁盘配额等
#
#  CAP_SYS_BOOT:允许重新启动系统
#
#  CAP_SYS_NICE:允许提升优先级及设置其他进程的优先级
#
#  CAP_SYS_RESOURCE:忽略资源限制
#
#  CAP_SYS_TIME:允许改变系统时钟
#
#  CAP_SYS_TTY_CONFIG:允许配置TTY设备
#
#  CAP_MKNOD:允许使用mknod()系统调用
#
#  CAP_LEASE:允许修改文件锁的FL_LEASE标志
```

## docker compose文件资源权限控制

```yaml
containers:
    security_opt:
      - apparmor:unconfined
```

## 镜像仓库

```shell
# 地址https://cr.console.aliyun.com/cn-hangzhou/instance/credentials
registry.cn-hangzhou.aliyuncs.com/fa


registry.cn-hangzhou.aliyuncs.com

```

## 查看docker容器

```shell
# 查询已死亡的docker容器
docker ps -aq -f status=dead
# 查询已退出的docker容器
docker ps -aq -f status=exited
```

## 查看磁盘占用

```shell
# linux命令
df -h
# Docker 的内置 CLI 指令
docker system df
# 查看详情
docker system df -v
```

## 磁盘空间清理

- [参考文章](https://blog.csdn.net/longailk/article/details/122728982)

```shell
## 通过 Docker 内置的 CLI 指令docker system prune来进行自动空间清理。

# 该指令默认会清除所有如下资源：
# 已停止的容器（container）
# 未被任何容器所使用的卷（volume）
# 未被任何容器所关联的网络（network）
# 所有悬空镜像（image）。
# 使用这个命令查看帮助 docker system prune --help
docker system prune -a

# 删除无用的卷
docker volume prune
# 删除无用的网络
docker network prune

## 手动清除

# 镜像清理
# 删除所有悬空镜像，不删除未使用镜像：
docker rmi $(docker images -f "dangling=true" -q)
# 删除所有未使用镜像和悬空镜像
docker rmi $(docker images -q)

# 清理卷
# 删除所有未被容器引用的卷
docker volume rm $(docker volume ls -qf dangling=true)

# 容器清理
# 删除所有已退出的容器：
docker rm -v $(docker ps -aq -f status=exited)
# 删除所有状态为dead的容器
docker rm -v $(docker ps -aq -f status=dead)
# 删除孤立的容器
docker container prune

## 查找系统中的大文件【以上三步仍然不可以的时候执行】

# 查找指定目录下所有大于100M的所有文件
find /var/lib/docker/overlay2/ -type f -size +100M -print0 | xargs -0 du -h | sort -nr

## 对标准输入日志大小与数量进行限制
# 新建或修改/etc/docker/daemon.json，添加log-dirver和log-opts参数
vi /etc/docker/daemon.json
    {
       "log-driver":"json-file",
       "log-opts": {"max-size":"3m", "max-file":"1"}
    }
# 重启docker的守护线程
systemctl daemon-reload
systemctl restart docker

## 实在没办法，只有把/var目录下所有日志文件清空
for i in `find /var -name *.log*`;do >$i;done
# 然后重启node节点，因为有些日志文件被占用，清空后空间仍然无法释放

```
