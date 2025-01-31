---
layout: default
title: '"plugins"'
nav_order: 15
description: Jenkins插件相关记录
parent: jenkins
has_children: false
permalink: "/docker/app/devs/jenkins/doc/plugins/"
---

# Jenkins插件相关记录

## jenkins 创建用户角色项目权限

- [参考文章](https://blog.csdn.net/u013066244/article/details/53407985)
- jenkins 创建用户角色项目权限
  - 安装Role-Based Strategy插件
  - 配置设置路径：
    - 系统管理->
      - 全局安全配置->授权策略->Role-Based Strategy
      - 管理用户->新建用户
      - Manage and Assign Roles->
        - Manage Roles->
          - Global roles->[全部->Read]
          - Item roles->[Pattern->"ma-.*"]|[任务->(Build|Read)]
        - Assign Roles->
          - Global roles->按实际情况配置
          - Item roles->按实际情况配置
