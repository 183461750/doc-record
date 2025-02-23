---
layout: default
title: deploy
nav_order: 14
description: 启动集群docker stack deploy -c kafka-compose.yml kafka 启动集群（two）docker stack
  deploy --compose-file=kafka-docker-compose.yml tools
parent: Doc
has_children: false
permalink: "/docker/mid/kafka/doc/deploy/"
grand_parent: Kafka
---

# 启动集群
docker stack deploy -c kafka-compose.yml kafka
# 启动集群（two）
docker stack deploy --compose-file=kafka-docker-compose.yml tools
