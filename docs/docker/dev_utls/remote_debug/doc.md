# 在idea中使用远程服务器中的docker进行debug远程容器中的Java程序

> 好处: 使用远程docker容器减轻本地环境的压力, 减少在本地环境安装Java程序需要依赖的一些乱七八糟的工具(例如LibreOffice)

## 使用说明

- 准备远程docker服务器

```bash
# 编辑文件`~/.ssh/config`

Host fa.intranet.company
  HostName 10.0.11.111
  User root
  IdentityFile ~/.ssh/id_ed25519

```

![docker1](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/remote_debug/imgs/docker1.png?raw=true)
![docker2](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/remote_debug/imgs/docker2.png?raw=true)
![docker3](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/remote_debug/imgs/docker3.png?raw=true)

- 编写Dockerfile

[参考文件地址](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/remote_debug/Dockerfile_local)

- idea配置

先点run自动生成基础配置
![run](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/remote_debug/imgs/run.png?raw=true)

然后点edit配置自动构建jar包后在启动docker容器

![edit1](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/remote_debug/imgs/edit1.png?raw=true)
![edit2](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/remote_debug/imgs/edit2.png?raw=true)

这时候就处理好了运行相关的配置，点击运行就可以在Docker中调试Java程序了。

- 添加debug配置

![debug1](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/remote_debug/imgs/debug1.png?raw=true)
![debug2](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/remote_debug/imgs/debug2.png?raw=true)
![debug3](https://github.com/183461750/doc-record/blob/main/docs/docker/dev_utls/remote_debug/imgs/debug3.png?raw=true)

这样就可以在idea中远程docker容器中的Java程序了。
