

---

如何用 5 步实现本地 HTTPS 开发？mkcert + OpenResty 保姆级教程

引言：告别「不安全」警告  
在本地开发中，你是否遇到过这些困扰？浏览器频繁提示「不安全连接」，微信小程序强制要求 HTTPS 接口，甚至某些前端 API 只能在加密环境下调用。  
本文将手把手教你用 mkcert 生成可信证书，结合 OpenResty 搭建本地 HTTPS 服务，5 步解决开发环境的安全焦虑！

---

一、工具准备：1 分钟搭建基础设施
1. 安装 mkcert  
   - Windows 用户可直接下载  ，Mac/Linux 用户通过包管理器安装：  
     ```bash
     brew install mkcert  # Mac
     sudo apt install mkcert  # Ubuntu
     ```
   - 初始化本地 CA 根证书：  
     ```bash
     mkcert -install
     ```
     *（系统会自动将 CA 证书加入信任列表，从此告别红色警告）* 

2. 安装 OpenResty  
   访问下载安装包，或通过命令安装：  
   ```bash
   # Ubuntu 示例
   wget -q https://openresty.org/package/pubkey.gpg
   sudo apt-key add pubkey.gpg
   sudo apt-get install openresty
   ```

---

二、证书生成：2 行命令搞定 HTTPS 密钥
1. 生成域名证书  
   在项目目录执行（支持多域名/IP）：  
   ```bash
   mkcert localhost 127.0.0.1 ::1 yourdomain.com
   ```
   *生成 `localhost+3.pem`（证书）和 `localhost+3-key.pem`（私钥）* 

2. 证书存放建议  
   创建专属目录管理证书，例如：  
   ```
   /usr/local/openresty/nginx/conf/ssl/
   ├── localhost+3.pem
   └── localhost+3-key.pem
   ```

---

三、OpenResty 配置：Nginx 的 HTTPS 魔法
编辑 `nginx.conf`，添加 HTTPS 服务块：  
```nginx
server {
    listen 443 ssl;
    server_name localhost;

    ssl_certificate     /usr/local/openresty/nginx/conf/ssl/localhost+3.pem;
    ssl_certificate_key /usr/local/openresty/nginx/conf/ssl/localhost+3-key.pem;

    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:8080; # 转发到本地服务
        proxy_set_header Host $host;
    }
}

HTTP 强制跳转 HTTPS（可选）
server {
    listen 80;
    server_name localhost;
    return 301 https://$host$request_uri;
}
```
-关键配置解读：*  
- `ssl_certificate` 指向 mkcert 生成的证书  
- `proxy_pass` 将 HTTPS 请求转发到本地 HTTP 服务 

---

四、服务验证：3 种方式测试 HTTPS
1. 浏览器访问  
   打开 `https://localhost`，地址栏显示 🔒安全 标识即成功（不再有警告！）

2. 命令行校验  
   ```bash
   curl -vIk https://localhost
   # 查看输出中的 SSL 握手信息
   ```

3. 证书详情检查  
   Chrome 浏览器 → 点击锁图标 → 查看证书 → 颁发者显示 「mkcert」 即正确 

---

五、进阶技巧：开发效率翻倍的秘诀
1. 多域名/端口支持  
   生成证书时追加域名：  
   ```bash
   mkcert "*.test.com" app.test.com 192.168.1.100
   ```
   Nginx 配置中通过 `server_name` 区分不同服务 

2. 局域网 HTTPS 测试  
   生成含内网 IP 的证书：  
   ```bash
   mkcert 192.168.1.100
   ```
   手机扫码安装 CA 证书后，即可用 HTTPS 访问开发机 

3. 证书自动更新（高阶）  
   结合 `lua-resty-auto-ssl` 实现证书自动签发：  
   ```lua
   lua_shared_dict auto_ssl 1m;
   init_by_lua_block {
       auto_ssl = require "resty.auto-ssl"
       auto_ssl.setup({ storage_dir = "/path/to/storage" })
   }
   ```
   *适合需要动态管理数百个域名的场景* 

---

常见问题排查表
| 现象                | 解决方案                     |
|---------------------|----------------------------|
| 浏览器提示证书无效   | 检查是否执行 `mkcert -install` |
| Nginx 启动报错       | 确认证书路径权限为 755       |
| 无法访问 443 端口    | 关闭防火墙或放行端口         |

---

结语：让本地开发更专业  
通过 mkcert + OpenResty 的组合，我们不仅解决了 HTTPS 的配置难题，更为团队协作、接口调试提供了标准化环境。现在，你可以自信地说：“我的本地服务，和线上一样安全！”

-本文部分方案参考自，更多技术细节可访问原文链接。*  
👉 转发给正在为 HTTPS 头疼的伙伴，一起告别「不安全」！ 