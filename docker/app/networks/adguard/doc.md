## DoH和DoT配置
- 使用Let’s Encrypt申请免费证书
- 註冊了一個 abc.com 的域名，請先去 DNS 管理後台新增一條 A 記錄
- 安装certbot

``` shell
# 切換 root 身份
$ sudo su
# 先更新系統
$ apt update && apt full-upgrade -y
# 安裝 certbot
$ apt install certbot
# 開始簽名，下面電子郵件跟域名請換成自己的
$ certbot certonly --standalone -n --agree-tos --email webmaster@abc.com --preferred-challenges http -d dns.abc.com
```
- 证书自动续约
``` shell
# 先測試看看自動更新證書有無問題，下面這一條指令會測試去更新，並不會實際去更新
$ certbot renew --dry-run
# 如無問題的話，接著我們要把兩個月簽名一次的工作加入排程
$ crontab -e

# 選擇 nano 文字編輯器，打開文件後，複製以下到裡面，然後保存退出
0 0 15 */2 * /usr/bin/certbot renew --quiet
# 如此每隔兩個月十五號他就會自動執行一次續簽證書


```
- 在 iOS 上使用 DNSCloak 設定 On demand 自動切換

    [参考文章](https://www.jkg.tw/p2660/)

## 封锁清单
- https://easylist-downloads.adblockplus.org/easylistchina.txt
- https://anti-ad.net/easylist.txt
- [参考文章](https://www.isharepc.com/27230.html)

## DNS服务器

```text
223.5.5.5
119.29.29.29
114.114.114.114
223.6.6.6
2400:3200::1
2400:3200:baba::1
https://dns.alidns.com/dns-query
tls://dns.alidns.com
```
