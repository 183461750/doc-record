FROM node:14.21.1-slim as builder

# 添加代理，用于加速npm构建
ENV https_proxy="http://10.0.16.17:7890" http_proxy="http://10.0.16.17:7890" all_proxy="socks5://10.0.16.17:7890"

WORKDIR /app

# 拷贝本地代码到容器中
COPY . .

# COPY package.json package-lock.json ./

#RUN npm run build

# 构建代码
RUN apt update && apt install git -y && node -v && npm --registry https://registry.npmmirror.com/ install && npm run build:test

# 下一阶段

FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf *

COPY --from=builder /app/dist .

RUN tee /etc/nginx/conf.d/default.conf <<-'EOF'
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;

    #access_log  /var/log/nginx/host.access.log  main;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

}
EOF

# ADD ./dist .
# ADD ./nginx/conf.d/default.conf /etc/nginx/conf.d/

EXPOSE 80
