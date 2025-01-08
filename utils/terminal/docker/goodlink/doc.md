# 两台主机之间直连

## docker启动

```bash
docker rm goodlink -f
# remote
docker run -d --name=goodlink --net=host --restart=always registry.cn-shanghai.aliyuncs.com/kony/goodlink --key=nas_202412140928
# local
docker run -d --name=goodlink --net=host --restart=always registry.cn-shanghai.aliyuncs.com/kony/goodlink --local=127.0.0.1:18080 --key=nas_202412140928
```
