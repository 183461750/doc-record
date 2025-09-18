# 一键快速发布服务

- 支持指定服务的更新
- 支持更新所有服务
- 处理服务的JAR文件上传和远程启动
- 支持配合idea于gradle使用
  - 双击即可发布服务到测试环境

[相关配置文件地址](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service)

## 使用说明

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
