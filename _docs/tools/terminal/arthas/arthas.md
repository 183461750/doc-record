---
layout: default
title: Arthas
nav_order: 1
description: arthas使用记录
parent: Terminal
has_children: false
permalink: "/tools/terminal/arthas/arthas/"
grand_parent: 工具集
---

# arthas使用记录

## 热部署

[参考文章](https://arthas.aliyun.com/doc/retransform.html#%E7%BB%93%E5%90%88-jad-mc-%E5%91%BD%E4%BB%A4%E4%BD%BF%E7%94%A8)

```bash
# 反编译类到磁盘中
jad --source-only com.mall.domain.enums.ShowFrequencyTypeEnum > /temp/ShowFrequencyTypeEnum.java
# 查看对应的类加载器
sc -d com.mall.domain.enums.ShowFrequencyTypeEnum | grep classLoaderHash
# 编译类(使用-d指定目录[ -d /tmp])
mc -c 344561e0 /temp/ShowFrequencyTypeEnum.java
# 加载类(复制控制台中打印的类全路径加载类)(PS: 使用jad的话, 重新加载的内容会被还原)
redefine /com/mall/domain/enums/ShowFrequencyTypeEnum.class xxx.class
# 或者使用retransform加载类(PS: 这个命令可以使用jad看到重新加载的内容)
retransform /com/mall/domain/enums/ShowFrequencyTypeEnum.class xxx.class

# PS: 无法直接上传文件的服务器, 可以使用base64编码上传, 然后使用mc命令进行加载
base64 < Test.class > result.txt
base64 -d < result.txt > Test.class
```
