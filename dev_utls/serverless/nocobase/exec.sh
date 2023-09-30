#!/bin/bash

source .env

./setup.sh

docker build -t $FC_DEMO_IMAGE .

echo ${DOCKER_PWD} | docker login -u ${FC_ACCOUNT} --password-stdin registry.${region}.aliyuncs.com

s deploy


#######################

# 测试
# s cli fc-api getFunction --serviceName NodejsCustomContainer --functionName nodejs --region ${region}