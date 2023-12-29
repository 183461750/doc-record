# tomcat部署war包相关文档

## 缺少字体的问题

- [对应的Dockerfile](./has-font/Dockerfile)

```bash
# 只需要在项目的docker部署文件Dockerfile里添加一行代码（在生成镜像需要外网）
RUN apk add --update font-adobe-100dpi ttf-dejavu fontconfig
```
