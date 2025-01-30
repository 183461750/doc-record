---
layout: default
title: 为什么通过ssh -R转发端口后, 只能通过127.0.0.1的IP访问, 不能通过外网IP访问? 要怎么做才能通过外网IP访问呢?
parent: ai
nav_order:       15
---

# 为什么通过ssh -R转发端口后, 只能通过127.0.0.1的IP访问, 不能通过外网IP访问? 要怎么做才能通过外网IP访问呢?

通过ssh -R转发端口后，只能通过127.0.0.1的IP访问，而不能通过外网IP访问的原因是默认情况下，SSH服务器只会监听本地回环地址（127.0.0.1）上的转发端口。这是为了安全考虑，防止未经授权的访问。

要通过外网IP访问转发的端口，需要进行以下步骤：

1. 在SSH服务器上修改配置文件：打开SSH服务器的配置文件（通常是/etc/ssh/sshd_config），找到并修改以下行：

   ```shell
   GatewayPorts yes
   ```

   这将允许SSH服务器监听所有网络接口上的转发端口，而不仅仅是本地回环地址。

2. 重启SSH服务器：保存配置文件修改后，重启SSH服务器以使修改生效。可以使用以下命令重启SSH服务器：

   ```shell
   sudo service ssh restart
   # 或者
   systemctl restart sshd
   ```

3. 在客户端使用外网IP访问：现在，你可以使用SSH客户端通过外网IP访问转发的端口。例如，如果你将端口转发到SSH服务器的端口2222，并且SSH服务器的外网IP是203.0.113.1，你可以使用以下命令连接到转发的端口：

   ```shell
   ssh -p 2222 user@203.0.113.1
   ```

   这将连接到SSH服务器，并将流量转发到转发的端口。

请注意，修改SSH服务器的配置文件可能需要管理员权限。此外，开放SSH服务器的转发端口可能会带来安全风险，请确保只允许受信任的主机访问转发的端口。

---
Learn more:

1. [ssh如何实现内网访问外网? - 知乎](https://www.zhihu.com/question/398993211)
2. [SSH的三种端口转发 - jeremy的技术点滴](https://jeremyxu2010.github.io/2018/12/ssh%E7%9A%84%E4%B8%89%E7%A7%8D%E7%AB%AF%E5%8F%A3%E8%BD%AC%E5%8F%91/)
3. [通过ssh反向连接内网主机的方法(防火墙的主机) - memphise - 博客园](https://www.cnblogs.com/memphise/articles/6472207.html)

## 相关问题

> sudo service ssh restart
这句命令执行失败了, 并且已经安装了ssh, 怎么解决
Failed to restart ssh.service: Unit not found.

根据搜索结果，"Failed to restart ssh.service: Unit not found"错误可能是由于使用了错误的命令或系统版本不同导致的。以下是解决此问题的几种可能方法：

1. 使用正确的命令：根据您的系统版本，尝试使用适当的命令来重启SSH服务。在CentOS 7及更高版本中，应使用以下命令：

   ```shell
   sudo systemctl restart sshd
   ```

   在Ubuntu 16.04及更高版本中，应使用以下命令：

   ```shell
   sudo systemctl restart ssh
   ```

   如果仍然出现相同的错误，请继续以下步骤。

2. 检查SSH服务的状态：使用以下命令检查SSH服务的状态，确保它已正确安装并正在运行：

   ```shell
   sudo systemctl status sshd
   ```

   如果SSH服务未安装或未运行，请尝试重新安装SSH服务器并启动服务。

3. 重新安装SSH服务器：如果SSH服务已正确安装但仍无法启动，请尝试重新安装SSH服务器。首先，卸载现有的SSH服务器：

   ```shell
   sudo apt-get purge openssh-server
   ```

   然后，重新安装SSH服务器：

   ```shell
   sudo apt-get install openssh-server
   ```

   最后，尝试重新启动SSH服务。

如果问题仍然存在，请提供更多详细信息，例如错误消息的完整内容和任何相关的日志文件，以便我们能够更好地帮助您解决问题。

---
Learn more:

1. [Failed to restart ssh.service: Unit not found.-CSDN博客](https://blog.csdn.net/u010433704/article/details/120057040)
2. [Failed to start ssh.service: Unit not found. - 等不到的口琴 - 博客园](https://www.cnblogs.com/Courage129/p/14073162.html)
3. [ssh - Cannot start sshd service: Failed to start openssh.service: Unit not found - Server Fault](https://serverfault.com/questions/904430/cannot-start-sshd-service-failed-to-start-openssh-service-unit-not-found)
