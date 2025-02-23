# nip.io使用记录

动态DNS神器nip.io使用指南：快速实现域名与IP的动态映射

> 本文基于开源项目 v1.2.1版本撰写，适用于开发测试、CI/CD等场景

---

一、项目简介
nip.io 是由Exentrique Solutions开发的开源动态DNS服务，通过智能解析机制实现任意IP地址与域名的动态映射。该服务无需注册或配置DNS记录，支持以下核心功能：

- 🌐 动态域名解析：将`<任意IP>.nip.io`自动解析对应IP
- 🚀 零配置使用：无需安装客户端或配置DNS服务器
- 🔧 通配符支持：支持多级子域名动态解析（如`app.10.0.0.1.nip.io`）
- 🐳 容器化部署：提供Docker镜像快速搭建私有服务

---

二、快速入门

场景1：使用公共DNS服务
直接在浏览器或应用中访问以下格式域名：

```bash
IPv4格式
http://your-app.192-168-1-100.nip.io  ➔ 解析到192.168.1.100
http://test.192.168.1.100.nip.io      ➔ 解析到192.168.1.100

IPv6格式（需使用破折号）
http://your-app.2001-0db8-85a3-0000-0000-8a2e-0370-7334.nip.io

```

场景2：自建私有服务

```bash
克隆项目
git clone https://github.com/exentriquesolutions/nip.io.git

使用Docker部署
bash build_and_run_docker.sh

```

---

三、进阶配置

1. 环境变量配置
通过环境变量覆盖默认配置：

[environment-variables-configuration-overrides](https://github.com/exentriquesolutions/nip.io/tree/master?tab=readme-ov-file#environment-variables-configuration-overrides)

---

四、典型应用场景

1. 本地开发调试

```bash
# 运行本地服务
python -m http.server 8080

# 通过域名访问
http://dev.127-0-0-1.nip.io:8080

```

1. Kubernetes服务暴露

```yaml
apiVersion: v1
kind: Service
metadata:
  name: demo-service
spec:
  type: ClusterIP
  externalIPs:
    - 192.168.1.100
  ports:
    - port: 80
---

# 通过域名访问
http://k8s.192.168.1.100.nip.io

```

---

> 项目地址：[GitHub - exentriquesolutions/nip.io](https://github.com/exentriquesolutions/nip.io)
> 更多技术细节可查阅项目Wiki文档
