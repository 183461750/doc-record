# 一键快速发布服务:配合idea与gradle使用(自定义多环境版)

> **v4版本更新**
> Date: 2025-09-30
>
> - 支持查看实时日志
>   - 利用idea的原生功能, 自动区分error日志(独立tab窗口查看), 快速感知都有哪些报错, 方便排查问题

![service-logs-to-idea-console](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service/v4/images/service-logs-to-idea-console-1.png?raw=true)

![service-logs-to-idea-console](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service/v4/images/service-logs-to-idea-console-2.png?raw=true)

[全版本更新日志](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service/version.md)

[相关配置文件地址](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service/v4)

## 使用说明

[部分说明可参考v2版本](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service/v2/doc.md)

### 添加自定义任务

修改以下配置去添加自定义任务即可实现多环境发布

- [发布服务任务gradle配置](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service/v4/project/script/publishServerTask.gradle)

- [添加对应环境的gradle属性](https://github.com/183461750/doc-record/blob/main/docs/tools/terminal/publishScript/update-service/v4/project/gradle-demo.properties)
