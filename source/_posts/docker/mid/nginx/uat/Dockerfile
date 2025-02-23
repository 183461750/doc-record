FROM nginx:1.15-alpine

COPY entrypoint.sh /usr/local/bin/
RUN chmod 755 /usr/local/bin/entrypoint.sh

COPY nginx.conf /etc/nginx/
COPY conf/cors.conf /etc/nginx/
#COPY ./conf.d/* /etc/nginx/conf.d/
COPY template/ /etc/nginx/template/

RUN mkdir -p /usr/lib/nginx/proxy_tmp && \
    mkdir -p /usr/lib/nginx/proxy_cache/imgcache && \
    chown -R nginx:nginx /usr/lib/nginx/proxy*

RUN apk add tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata

VOLUME var/log/

ENTRYPOINT ["entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]