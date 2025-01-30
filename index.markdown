---
layout: home
title: "Doc Record"
list_title: Documentation
---

# Documentation Index

{% assign doc_dirs = "books,docker,k8s,lang,materiel,middleware,os,utils" | split: "," %}

{% for dir in doc_dirs %}
## {{ dir | capitalize }}

{% comment %} 获取当前目录下的所有文件 {% endcomment %}
{% assign dir_files = site.pages | where_exp: "item", "item.path contains dir" | where_exp: "item", "item.path contains '.md' or item.path contains '.markdown'" %}
{% assign sorted_files = dir_files | sort: "path" %}

{% comment %} 记录已处理的目录 {% endcomment %}
{% assign processed_dirs = "" | split: "" %}

{% for doc in sorted_files %}
  {% assign path_parts = doc.path | split: "/" %}
  {% assign current_path = "" %}
  {% assign show_file = true %}
  
  {% comment %} 检查是否应该显示该文件 {% endcomment %}
  {% if doc.path contains ".git" or doc.path contains "assets" or doc.path contains "_site" or doc.path contains "node_modules" or doc.path contains ".DS_Store" %}
    {% assign show_file = false %}
  {% endif %}

  {% if show_file %}
    {% comment %} 显示目录结构 {% endcomment %}
    {% for part in path_parts %}
      {% if forloop.first == false and forloop.last == false %}
        {% assign current_path = current_path | append: "/" | append: part %}
        {% unless processed_dirs contains current_path %}
          {% assign indent = "" %}
          {% assign level = forloop.index | minus: 2 %}
          {% for i in (1..level) %}
            {% assign indent = indent | append: "  " %}
          {% endfor %}
{{ indent }}### {{ part }}
          {% assign processed_dirs = processed_dirs | push: current_path %}
        {% endunless %}
      {% endif %}
    {% endfor %}

    {% comment %} 显示文件链接 {% endcomment %}
    {% assign indent = "" %}
    {% assign level = path_parts.size | minus: 2 %}
    {% for i in (1..level) %}
      {% assign indent = indent | append: "  " %}
    {% endfor %}
{{ indent }}- {% if doc.title %}[{{ doc.title }}]({{ doc.url | relative_url }}){% else %}[{{ doc.path | split: "/" | last | remove: ".md" | remove: ".markdown" }}]({{ doc.url | relative_url }}){% endif %}
  {% endif %}
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
