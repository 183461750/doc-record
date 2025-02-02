---
layout: default
title: Home
nav_order: 1
description: "文档记录站点"
permalink: /
---

# 文档记录站点

欢迎来到文档记录站点。这里收集了各种技术文档和笔记。

## 主要分类

{% assign doc_dirs = "books,docker,k8s,lang,materiel,middleware,os,utils" | split: "," %}

{% for dir in doc_dirs %}
### {{ dir | capitalize }}

{% assign dir_files = site.pages | where_exp: "item", "item.path contains dir" | where_exp: "item", "item.path contains '.md' or item.path contains '.markdown'" %}
{% assign sorted_files = dir_files | sort: "path" %}

{% for doc in sorted_files %}
- [{{ doc.title | default: doc.path | split: '/' | last }}]({{ doc.url | relative_url }})
{% endfor %}

{% endfor %}

## Recent Posts
<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <span class="post-meta">{{ post.date | date: "%Y-%m-%d" }}</span>
    </li>
  {% endfor %}
</ul>
