# maxkb使用记录

[官网安装目录](https://maxkb.cn/docs/installation/online_installtion/)

## 安装

```bash
docker run -d --name=maxkb --restart=always -p 8080:8080 -v ~/.maxkb:/var/lib/postgresql/data -v ~/.python-packages:/opt/maxkb/app/sandbox/python-packages registry.fit2cloud.com/maxkb/maxkb

```
