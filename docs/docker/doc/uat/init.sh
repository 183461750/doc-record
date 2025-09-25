#!/bin/bash

chmod -R 777 ./iuin/uploads/
chmod -R 777 ./iuin/logs/

## create network in swarm manager
docker network create -d  overlay --attachable iuin

## create mysql service
#docker stack up -c ./mysql.yml mysql

## create rocketmq service
docker stack up -c ./rocketmq.yml  mq

## create gpdb service
#docker stack up -c ./gpdb.yml gpdb

## create zookeeper service
docker stack up -c ./zookeeper.yml zk

## create redis service
docker stack up -c ./redis.yml redis

## create app service
#docker stack up -c ./app.yml app

