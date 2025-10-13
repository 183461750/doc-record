# 远程交互(idea使用gradle与远程服务器间的交互--发布服务与连接arthas)

- 操作简单, 一键双击即可
- 双击发布指定服务到指定服务器并实时显示日志
- 双击连接指定服务器中的指定服务的arthas

> 后续迭代功能:
> 实时显示指定服务器中的指定服务的日志

[相关配置文件地址](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/remote_interaction/v1)

## 使用说明

```bash
vi ~/.ssh/config

# 开发环境
Host xxx.dev.iuin
  HostName 1.0.1.1
  User root
  IdentityFile ~/.ssh/id_ed25519_iu

```

```bash
# 根据项目更新`base.sh`文件中的环境变量
项目目录: LOCAL_BASE_DIR="/Users/fa/dev/projects/IdeaProjects/company/iuin/mall/private-deploy/xxx-sbbc"
远程服务地址: REMOTE_SERVER="xxx.dev.iuin"
远程服务目录前缀: REMOTE_BASE_DIR="/data/xxx"
```

### 结合gradle使用

项目根目录的`build.gradle`文件添加相关任务(配置已在上面提供的地址中了)

```bash
# 项目根目录执行
mkdir script
# 将上面提到的文件夹中的文件添加进去(配置已在上面提供的地址中了)
# 并在项目根目录中添加对应的配置文件与引用代码
```

```bash
# bash ./gradlew :pay-service:publishToTest --info
bash ./gradlew :pay-service:publishToTest
```

![gradle task示例](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/remote_interaction/imgs/gradle_task.png?raw=true)
