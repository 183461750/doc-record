## 安装node_exporter
```shell
1、wget https://github.com/prometheus/node_exporter/releases/download/v1.1.2/node_exporter-1.1.2.linux-amd64.tar.gz
2、tar -zxf node_exporter-1.1.2.linux-amd64.tar.gz -C /usr/local/
3、cd /usr/local/
4、mv /usr/local/node_exporter-1.1.2.linux-amd64/ /usr/local/node_exporter
5、vim config.yml(配置访问的用户名密码，可根据需要跳过这一步)
```
- 使用htpasswd加密密码，加密方式为htpasswd -nBC 12 '' | tr -d ':\n'
- config.yml
```shell
basic_auth_users:
  # 当前设置的用户名为 prometheus ， 可以设置多个
  # 密码加密方式 htpasswd -nBC 12 '' | tr -d ':\n'
  username: password
```
```shell
6、nohup /usr/local/node_exporter/node_exporter --web.config=./config.yml &
nohup ./node_exporter --web.config=./config.yml &
```