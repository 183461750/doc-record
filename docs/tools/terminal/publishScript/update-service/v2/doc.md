# 一键快速发布服务:配合idea与gradle使用

- v2版本更新

当存在bootJar任务时, 优先使用bootJar打包的jar文件
配合gradle使用时, 不再需要配置`LOCAL_BASE_DIR`环境变量, 改为了自动获取
启动服务命令改为了systemctl(因为新版jar服务被systemctl管理了, 并且systemctl启动配置中指定了www用户启动)

- 支持指定服务的更新
- 支持更新所有服务
- 处理服务的JAR文件上传和远程启动
- 支持配合idea与gradle使用
  - 双击即可发布服务到测试环境

[相关配置文件地址](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service/v2)

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
远程服务地址: REMOTE_SERVER="xxx.dev.iuin"
远程服务目录前缀: REMOTE_BASE_DIR="/data/xxx"
```

```bash
chmod +x base.sh
bash base.sh
```

### 结合gradle使用

项目根目录的`build.gradle`文件添加相关任务(配置已在上面提供的地址中了)

```bash
# 项目根目录执行
mkdir script
# 将`base.sh`和`update-service.sh`文件添加进去(配置已在上面提供的地址中了)
```

```bash
# bash ./gradlew :pay-service:publishToTest --info
bash ./gradlew :pay-service:publishToTest
# 或者直接在idea中直接双击这个任务即可
```

![gradle示例](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service/imgs/gradle-demo.png?raw=true)
