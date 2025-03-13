#!/bin/sh

if [ "$SUB_DOMAIN_WEB" != "" ]

then
    envsubst '$SUB_DOMAIN_WEB' < /etc/nginx/template/web.conf > /etc/nginx/conf.d/web.conf
fi

if [ "$SUB_DOMAIN_WEB_API" != "" ]

then
    envsubst '$SUB_DOMAIN_WEB_API' < /etc/nginx/template/web-api.conf > /etc/nginx/conf.d/web-api.conf
fi

if [ "$SUB_DOMAIN_WAP" != "" ]

then
    envsubst '$SUB_DOMAIN_WAP' < /etc/nginx/template/wap.conf > /etc/nginx/conf.d/wap.conf
fi

if [ "$SUB_DOMAIN_WAP_API" != "" ]

then
    envsubst '$SUB_DOMAIN_WAP_API' < /etc/nginx/template/wap-api.conf > /etc/nginx/conf.d/wap-api.conf
fi

if [ "$SUB_DOMAIN_IMAGE" != "" ]

then
    envsubst '$SUB_DOMAIN_IMAGE' < /etc/nginx/template/image.conf > /etc/nginx/conf.d/image.conf
fi

if [ "$SUB_DOMAIN_STATIC" != "" ]

then
    envsubst '$SUB_DOMAIN_STATIC' < /etc/nginx/template/static.conf > /etc/nginx/conf.d/static.conf
fi

if [ "$SUB_DOMAIN_MADATA" != "" ]

then
    envsubst '$SUB_DOMAIN_MADATA' < /etc/nginx/template/madata.conf > /etc/nginx/conf.d/madata.conf
fi

if [ "$SUB_DOMAIN_JSSDK" != "" ]

then
    envsubst '$SUB_DOMAIN_JSSDK' < /etc/nginx/template/jssdk.conf > /etc/nginx/conf.d/jssdk.conf
fi

if [ "$SUB_DOMAIN_ADMIN" != "" ]

then
    envsubst '$SUB_DOMAIN_ADMIN' < /etc/nginx/template/admin.conf > /etc/nginx/conf.d/admin.conf
fi

if [ "$SUB_DOMAIN_ADMIN_API" != "" ]

then
    envsubst '$SUB_DOMAIN_ADMIN_API' < /etc/nginx/template/admin-api.conf > /etc/nginx/conf.d/admin-api.conf
fi

if [ "$SUB_DOMAIN_HAPROXY" != "" ]

then
    envsubst '$SUB_DOMAIN_HAPROXY' < /etc/nginx/template/haproxy.conf > /etc/nginx/conf.d/haproxy.conf
fi

if [ "$SUB_DOMAIN_ZK" != "" ]

then
    envsubst '$SUB_DOMAIN_ZK' < /etc/nginx/template/zk.conf > /etc/nginx/conf.d/zk.conf
fi

if [ "$SUB_DOMAIN_DA" != "" ]

then
    envsubst '$SUB_DOMAIN_DA' < /etc/nginx/template/da.conf > /etc/nginx/conf.d/da.conf
fi

if [ "$SUB_DOMAIN_MQ" != "" ]

then
    envsubst '$SUB_DOMAIN_MQ' < /etc/nginx/template/mq.conf > /etc/nginx/conf.d/mq.conf
fi

exec "$@"