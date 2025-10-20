# 远程交互(idea使用gradle与远程服务器间的交互--发布服务与连接arthas)

> **v2版本更新内容**
> Date: 2025-10-20
>
> - 自动生成任务, 根据gradle环境属性文件生成对应环境的任务, 这样就只需要添加环境属性文件即可了

## 后续优化

- arthas的交互体验, 目前只能一次性交互, 需要重新连接
  - 如何让远程服务器识别到我在idea中的gradle task console中输入的`^c`的mac快捷键

- 看看如何把这完整的功能打成插件包, 放到阿里制品库中, 实现通过gradle依赖引入即可拥有这些功能

[所有版本功能文档](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/remote_interaction/version.md)

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

[文档GitHub地址](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/remote_interaction/v2/doc.md)

将GitHub中这个文档同级目录中的所有文件及文件夹都复制到项目根目录后刷新gradle即可(点击上面的链接可以直接跳转到对应目录)

```bash
# bash ./gradlew :pay-service:publishToTest --info
bash ./gradlew :pay-service:publishToTest
```

![gradle task示例](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/remote_interaction/imgs/gradle_task.png?raw=true)

### 结合arthas命令查看sql, Redis, es命令

[参考查看sql命令地址](https://github.com/183461750/doc-record/blob/main/docs/materiel/article/arthas查看sql.md)
[参考查看sql_redis_es命令地址](https://github.com/183461750/doc-record/blob/main/docs/materiel/draft/arthas查看sql_redis_es.md)
