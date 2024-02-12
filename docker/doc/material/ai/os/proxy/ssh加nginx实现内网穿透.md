# ssh加nginx实现内网穿透

- 外网服务器nginx配置

```shell
# 创建配置文件
tee /etc/nginx/conf.d/ssh.conf <<-'EOF'
server {
    listen       80;
    listen  [::]:80;
    server_name  127.0.0.1 localhost 210.21.48.11;

    access_log  /var/log/nginx/ssh_access.log  main;

    location /8888 {
        proxy_pass http://127.0.0.1:8888;
    }

}
EOF

# 重载nginx配置
nginx -s reload

## 如果没有安装nginx
# 方式一
docker run --network=host -v /etc/nginx/conf.d/ssh.conf:/etc/nginx/conf.d/ssh.conf -i --rm nginx

# 方式二
# 安装nginx(docker安装nginx)
docker run --network=host -it --rm nginx bash
# 执行命令
nohup /docker-entrypoint.sh nginx -g 'daemon off;' &
```

- 内网服务器ssh配置

```shell
# 默认是在本地回环地址上，需要其他机器访问的话可以指定 ip 或者增加 -g 参数开启网关模式
ssh -N -R 210.21.48.69:8888:192.168.3.14:8888 ljf@210.21.48.69 -p 10086
```
