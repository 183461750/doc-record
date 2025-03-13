# 使用官方 CentOS 基础镜像(PS: latest版拉取openssh-server依赖报错)
# FROM ubuntu:24.04
FROM registry.cn-hangzhou.aliyuncs.com/iuin/ubuntu:24.04

WORKDIR /data/actions-runner

# ENV https_proxy=http://192.168.0.121:7890 http_proxy=http://192.168.0.121:7890 all_proxy=socks5://192.168.0.121:7890

RUN apt-get update && apt-get install -y curl

# GitHub pages actions-runner
RUN curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/download/v2.320.0/actions-runner-linux-x64-2.320.0.tar.gz && \
    tar xzf ./actions-runner.tar.gz && ./bin/installdependencies.sh
