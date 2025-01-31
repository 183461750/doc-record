---
layout: default
title: doc
nav_order: 16
description: 问题记录
parent: elasticsearch
has_children: false
permalink: "/docker/app/devs/data/elasticsearch/problems/problems/"
---

# 问题记录

```md
{"@timestamp":"2024-05-25T06:33:04.830Z", "log.level":"ERROR", "message":"node validation exception\n[1] bootstrap checks failed. You must address the points described in the following [1] lines before starting Elasticsearch. For more information see [https://www.elastic.co/guide/en/elasticsearch/reference/8.11/bootstrap-checks.html]\nbootstrap check failure [1] of [1]: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]; for more information see [https://www.elastic.co/guide/en/elasticsearch/reference/8.11/_maximum_map_count_check.html]", "ecs.version": "1.2.0","service.name":"ES_ECS","event.dataset":"elasticsearch.server","process.thread.name":"main","log.logger":"org.elasticsearch.bootstrap.Elasticsearch","elasticsearch.node.name":"es01","elasticsearch.cluster.name":"es-docker-cluster"}

我用docker-compose启动es, 报错了

AI答:

根据您提供的错误日志和之前的笔记，您在使用Docker Compose启动Elasticsearch时遇到了"max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]"的错误。这是一个常见的问题，通常是因为Elasticsearch需要较高的`vm.max_map_count`设置来正常运行，而默认值通常不足以满足其需求。

要解决这个问题，您需要在宿主机上增加`vm.max_map_count`的值。这里有两种方法可以做到这一点：

1. **临时设置**（重启后失效）：
   执行以下命令：
   ```shell
   sudo sysctl -w vm.max_map_count=262144
   ```

   这将立即生效，但如果宿主机重启，您需要重新执行此命令。

2. **永久设置**：

   编辑`/etc/sysctl.conf`文件，在文件末尾添加以下行：

    ```shell
    vm.max_map_count=262144
    ```

   然后执行`sysctl -p`命令使更改生效。这种方法的好处是，即使宿主机重启，设置也会保持。

请注意，如果您使用的是Docker Desktop的WSL2后端或其他虚拟化环境，可能需要在不同的地方进行设置。例如，在WSL2中，您可能需要在Windows的命令提示符或PowerShell中执行以下命令来调整WSL2虚拟机的设置：
    ```shell
    wsl -d docker-desktop sysctl -w vm.max_map_count=262144
    ```
或者，根据您的环境，可能需要查找特定于环境的设置方法。

完成这些设置后，重新启动您的Elasticsearch容器，应该能够解决启动时遇到的`vm.max_map_count`错误。

```
