# 一键快速发布服务

- 支持指定服务的更新
- 支持更新所有服务
- 处理服务的JAR文件上传和远程启动
- 支持配合idea于gradle使用
  - 双击即可发布服务到测试环境

[相关配置文件地址](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service)

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
项目目录: LOCAL_BASE_DIR="/Users/fa/dev/projects/IdeaProjects/company/iuin/lingxi/private-deploy/xxx-sbbc"
远程服务地址: REMOTE_SERVER="xxx.dev.iuin"
远程服务目录前缀: REMOTE_BASE_DIR="/data/xxx"
```

```bash
bash base.sh
```

### 结合gradle使用

参考配置`build.gradle`文件

```bash
# bash ./gradlew :pay-service:publishToTest --info
bash ./gradlew :pay-service:publishToTest
```

[gradle示例](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service/imgs/gradle-demo.png)
