# docker镜像相关文档

## 配置代理镜像源

```bash
vi /etc/docker/daemon.json
```

```json
{
    "registry-mirrors": [
             "https://[你的加速器ID].mirror.swr.myhuaweicloud.com",
            "https://[你的加速器ID].mirror.aliyuncs.com",
            "https://huecker.io"
    ]
}
```
