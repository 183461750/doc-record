# 远程交互(idea使用gradle与远程服务器间的交互--发布服务与连接arthas)

> **v1版本更新内容**
> Date: 2025-10-13
>
> - 操作简单, 一键双击即可
> - 双击发布指定服务到指定服务器并实时显示日志
>   - idea与日志打印能联动, 点击日志中的类能跳到具体的代码行
>   - 异常分组功能, 目前idea只能检测以`Caused by:`开头的异常才进行分组
> - 双击实时显示指定服务器中的指定服务的日志
>   - 日志行为idea控制台能容纳的最大行, 后续有新增日志实时滚动显示
> - 双击连接指定服务器中的指定服务的arthas

## 后续优化

- arthas的交互体验, 目前只能一次性交互, 需要重新连接
- 增加远程服务器连接功能

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

### 结合arthas命令查看sql, Redis, es命令

[参考查看sql命令地址](https://github.com/183461750/doc-record/blob/main/docs/materiel/article/arthas查看sql.md)
[参考查看sql_redis_es命令地址](https://github.com/183461750/doc-record/blob/main/docs/materiel/draft/arthas查看sql_redis_es.md)
