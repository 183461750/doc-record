
# 修改docker容器的密码, 并且开启ssh远程连接

要修改Docker容器的密码并开启SSH远程连接，你需要确保容器中运行了一个SSH服务器。以下是一个基于Ubuntu镜像的示例，说明如何创建一个Docker容器，安装SSH服务器，设置一个root密码，并允许远程SSH连接。

1. 创建一个Dockerfile，用于构建包含SSH服务器的镜像：

```Dockerfile
# 使用官方Ubuntu镜像
FROM ubuntu
# 安装SSH服务器
RUN apt-get update && apt-get install -y openssh-server
RUN mkdir /var/run/sshd
RUN echo 'root:password' | chpasswd
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
# 允许密码认证
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
# 开放SSH端口
EXPOSE 22
# 启动SSH服务
CMD ["/usr/sbin/sshd", "-D"]
```

请注意，这个Dockerfile中使用了非常简单的密码（`password`）作为示例。在实际使用中，你应该使用一个更复杂的密码。
2. 使用Dockerfile构建镜像：

```bash
docker build -t my-ssh-image .
```

3. 运行容器：

```bash
docker run -d -p 2222:22 my-ssh-image
```

这个命令将容器内部的22端口映射到宿主机的2222端口，以便你可以通过SSH连接到宿主机的2222端口来访问容器。
4. 使用SSH客户端连接到容器：

```bash
ssh root@<your-host-ip> -p 2222
```

将`<your-host-ip>`替换为你的宿主机IP地址。当你第一次连接时，SSH客户端可能会警告你新主机身份无法验证，输入`yes`以继续。
5. 如果你需要修改已经运行的容器的root密码，你可以进入容器并使用`passwd`命令：

```bash
docker exec -it <container-id> passwd
```

将`<container-id>`替换为你的容器ID。然后按照提示输入新密码。
请确保你了解这些操作的安全性影响。在生产环境中，使用SSH访问容器时应该采取额外的安全措施，例如使用SSH密钥而不是密码，以及限制可以访问容器的IP地址。此外，运行SSH服务可能会增加安全风险，因此请确保你了解这些风险并采取适当的安全措施。
