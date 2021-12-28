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
# 在 其中的ExecStart=后添加配置
-H tcp://0.0.0.0:2375 -H unix:///var/run/docker.sock

# 刷新配置，重启服务
systemctl daemon‐reload  # 刷新服务
systemctl restart docker # 重新启动docker
docker start registry  # 启动registry

```

