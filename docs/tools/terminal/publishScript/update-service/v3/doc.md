# 一键快速发布服务:配合idea与gradle使用(自定义多环境版)

> **v3版本更新**
> Date: 2025-09-28
>
> - 简化脚本逻辑
> - 支持配置文件化
> - 支持多环境配置
> - 支持idea与gradle结合使用

[相关配置文件地址](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service/v3)

## 使用说明

[部分说明可参考v2版本](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service/v2/doc.md)

### 添加自定义任务

修改以下配置去添加自定义任务即可实现多环境发布

- [发布服务任务gradle配置](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service/v3/project/script/publishServerTask.gradle)

- [添加对应环境的gradle属性](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service/v3/project/gradle-demo.properties)
