---
layout: default
title: proxyman和arthas结合监听java进程网络(包括feign调用等)
parent: materiel
nav_order:       12
---

# 使用arthas和proxyman监听java进程网络(包括feign调用等)

## 相关命令

```bash
# proxyman代理环境变量
export https_proxy=http://10.0.4.190:9091 http_proxy=http://10.0.4.190:9091

# 设置 HTTP/HTTPS 代理
sysprop https.proxyHost 10.0.4.190
sysprop https.proxyPort 9091
sysprop http.proxyHost 10.0.4.190
sysprop http.proxyPort 9091

# 验证
sysprop | grep proxy

# 因为feign调用用的是服务名, 没有IP和port, 所有现在考虑将本地流量代理到指定服务器中去(不行, 没搞成)
# 改成用proxyman代理到指定服务器中去(用的远程映射功能, 例如 gateway-service -> feign.microservice.debug:8100)(然后结合SwitchHosts工具, 将feign.microservice.debug映射到10.0.1.94 IP上, 这样子, 之后只需要改SwitchHosts中的IP就能实现访问到不同的服务器上去了(当然, 直接切换开关的方式也行))

```
