#!/bin/bash

source .env

./setup.sh

docker build -t $FC_DEMO_IMAGE .

docker logout

echo ${DOCKER_PWD} | docker login -u ${DOCKER_ACCOUNT} --password-stdin registry.${region}.aliyuncs.com

s deploy

docker logout


#######################

# 测试
# s cli fc-api getFunction --serviceName NodejsCustomContainer --functionName nodejs --region ${region}