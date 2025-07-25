
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

# 移除 HTTP/HTTPS 代理(使用System.clearProperty方式移除)
ognl '@java.lang.System@clearProperty("https.proxyHost")'
ognl '@java.lang.System@clearProperty("https.proxyPort")'
ognl '@java.lang.System@clearProperty("http.proxyHost")'
ognl '@java.lang.System@clearProperty("http.proxyPort")'

# 验证
sysprop | grep proxy

# 因为feign调用用的是服务名, 没有IP和port, 所有现在考虑将本地流量代理到指定服务器中去(不行, 没搞成)
# 改成用proxyman代理到指定服务器中去(用的远程映射功能, 例如 gateway-service -> feign.microservice.debug:8100)(然后结合SwitchHosts工具, 将feign.microservice.debug映射到10.0.1.94 IP上, 这样子, 之后只需要改SwitchHosts中的IP就能实现访问到不同的服务器上去了(当然, 直接切换开关的方式也行))
    * PS: 不用这么麻烦, 上面是因为DNS劫持导致域名没有找到IP才需要做的操作, 域名之所以被劫持还是因为开了clash代理(默认劫持了DNS)

```
