# docker swarm networks问题解决方案

根据搜索结果，以下是关于如何更改Docker Ingress网络默认子网范围的解决方案：

1. 首先，我们需要确认当前Docker Ingress网络的默认子网范围。可以使用以下命令检查网络配置信息：`docker network inspect ingress` [[1]](https://stackoverflow.com/questions/42954017/how-to-change-ip-address-range-of-docker-swarm-ingress-network)。
2. 如果默认子网范围与您的计算机子网范围冲突，您可以尝试以下方法来更改Docker Ingress网络的子网范围：

   - 方法一：使用Docker Swarm命令行选项来指定子网范围。在初始化或加入Docker Swarm时，可以使用`--default-addr-pool`选项来指定子网范围。例如：`docker swarm init --default-addr-pool 192.168.0.0/16` [[1]](https://stackoverflow.com/questions/42954017/how-to-change-ip-address-range-of-docker-swarm-ingress-network)。
   - 方法二：编辑Docker的守护进程配置文件`daemon.json`来指定子网范围。您可以使用以下步骤进行操作：
     - 使用文本编辑器打开`/etc/docker/daemon.json`文件（在Windows上是`C:\ProgramData\Docker\config\daemon.json`）。
     - 添加以下内容到文件中：
       ```
       {
         "default-address-pools": [
           {"base":"192.168.0.0/16","size":24}
         ]
       }
       ```
       将`192.168.0.0/16`替换为您想要的子网范围。
     - 保存文件并重启Docker服务，以使更改生效。在Linux上，可以使用`sudo systemctl restart docker`命令来重启Docker服务，在Windows上，可以通过Docker桌面界面的"Troubleshoot"选项来重启Docker Desktop [[2]](https://support.hyperglance.com/knowledge/changing-the-default-docker-subnet)。

请注意，更改Docker网络的子网范围可能会影响到已经运行的容器和网络连接，请谨慎操作并确保备份重要数据。

---
Learn more:
1. [networking - How to change ip address range of docker swarm ingress network - Stack Overflow](https://stackoverflow.com/questions/42954017/how-to-change-ip-address-range-of-docker-swarm-ingress-network)
2. [How to change the default docker subnet IP range](https://support.hyperglance.com/knowledge/changing-the-default-docker-subnet)
3. [Changing Docker's default subnet IP range | cylab.be](https://cylab.be/blog/277/changing-dockers-default-subnet-ip-range)