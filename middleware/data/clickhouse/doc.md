# clickhouse

## 安装指定版本

[参考文章](https://clickhouse.com/docs/zh/getting-started/install#from-tgz-archives)

```bash
# 执行安装脚本(中途需要输入`default`用户的密码, 以及是否允许默认用户从任何地方访问)
bash ./clickhouse-install.sh
# 启动
sudo /etc/init.d/clickhouse-server start
# 连接
clickhouse-client
# 示例
SELECT 1
```
