# vllm使用记录

[GitHub地址](https://github.com/vllm-project/vllm)

## 安装

```bash
# 安装 Miniconda
# 运行安装脚本：

# Linux：
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh -b -p ${HOME}/software/miniconda3
# macOS：
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-x86_64.sh
bash Miniconda3-latest-MacOSX-x86_64.sh -b -p ${HOME}/software/miniconda3

# 配置环境变量：

# 将以下内容添加到 ~/.bashrc 或 ~/.zshrc 文件中：
export PATH=${HOME}/software/miniconda3/bin:$PATH
# 刷新环境变量：
source ~/.bashrc
# 验证安装：
conda --version
# 如果显示版本号，说明安装成功。
```

```bash
# (Recommended) Create a new conda environment.
conda create -n vllm python=3.12 -y
conda activate vllm
# PS: 有时可能需要先初始化 conda init 然后执行 bash 重新打开终端, 之后才能使用 conda activate vllm
# 取消激活环境
conda deactivate


# 配置 pip 源
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple/
pip config set install.trusted-host pypi.tuna.tsinghua.edu.cn


# 在虚拟环境中安装 vllm 0.4.2 版本
pip install vllm==0.4.2
# 或者安装最新版本
pip install vllm
```

- docker 安装

```bash
# vLLM 提供了一个官方 Docker 镜像用于部署。该镜像可用于运行与 OpenAI 兼容服务器，并且可在 Docker Hub 上以 vllm/vllm-openai 的形式获取。
# PS: 需要英伟达运行时
docker run --runtime nvidia --gpus all \
    -v ~/.cache/huggingface:/root/.cache/huggingface \
    --env "HUGGING_FACE_HUB_TOKEN=<secret>" \
    -p 8000:8000 \
    --ipc=host \
    vllm/vllm-openai:latest \
    --model mistralai/Mistral-7B-v0.1
```

- 源码安装

[环境变量参数说明](https://docs.vllm.ai/en/latest/getting_started/installation/cpu.html#related-runtime-environment-variables)

```bash
# 启用Docker BuildKit
#    export DOCKER_BUILDKIT=1
#    export COMPOSE_DOCKER_CLI_BUILD=1
docker build -f docker/Dockerfile.cpu --tag vllm-cpu-env --target vllm-openai .
# 启用代理, 并且不使用缓存
# 在 Dockerfile 中添加以下代码确保代理生效：
# ARG HTTP_PROXY
# ARG HTTPS_PROXY
# ENV HTTP_PROXY=$HTTP_PROXY
# ENV HTTPS_PROXY=$HTTPS_PROXY
#
docker build \
    --build-arg "HTTP_PROXY=http://10.0.4.59:9090" \
    --build-arg "HTTPS_PROXY=http://10.0.4.59:9090" \
    --no-cache \
    -f docker/Dockerfile.cpu --tag vllm-cpu-env --target vllm-openai .
docker run --rm \
             --privileged=true \
             --shm-size=4g \
             -p 8000:8000 \
             # 表示 KV 缓存空间为 8 GiB
             -e VLLM_CPU_KVCACHE_SPACE=8 \
             # 表示将有 32 个 OpenMP 线程绑定在 0-31 个 CPU 内核上。
             -e VLLM_CPU_OMP_THREADS_BIND=0-31 \
             vllm-cpu-env \
             --model=meta-llama/Llama-3.2-1B-Instruct \
             --dtype=bfloat16 \
             other vLLM OpenAI server arguments
```

- docker安装(openai版镜像)(亲测可用)

```bash
docker run -it --rm vllm/vllm-openai:v0.7.3 --device cpu
# docker run -it --rm vllm/vllm-openai:v0.7.3 --device cpu --model Qwen/Qwen2.5-1.5B-Instruct
# 进入容器, 启动模型
vllm serve Qwen/Qwen2.5-1.5B-Instruct
# 自定义key
vllm serve NousResearch/Meta-Llama-3-8B-Instruct --dtype auto --api-key token-abc123

# 其他用法
# docker run带上代理的环境变量
docker run -d -e http_proxy=http://10.0.5.93:9090 -e https_proxy=http://10.0.5.93:9090 vllm/vllm-openai:v0.7.3 --device cpu --model hf.co/sesame/csm-1b
# 还需要把端口映射出来
docker run -d -e http_proxy=http://10.0.5.93:9090 -e https_proxy=http://10.0.5.93:9090 -p 8000:8000 vllm/vllm-openai:v0.7.3 --device cpu --model sesame/csm-1b

# 差授权
docker run -d -e http_proxy=http://10.0.4.59:9090 -e https_proxy=http://10.0.4.59:9090 -e HUGGING_FACE_HUB_TOKEN=<TOKEN> -p 8000:8000 vllm/vllm-openai --device cpu --model google/gemma-3-1b-it
```

- uv方式安装

```bash
uv venv vllm_env --python 3.12 --seed
source vllm_env/bin/activate
uv pip install vllm

# 另一种令人愉快的方法是使用带有 --with [dependency] 选项的 uv run，它允许你运行诸如 vllm serve 之类的命令，而无需创建环境：
uv run --with vllm vllm --help

```

## 使用

```bash
# Run the following command to start the vLLM server with the Qwen2.5-1.5B-Instruct model:
vllm serve Qwen/Qwen2.5-1.5B-Instruct
vllm serve BAAI/bge-reranker-v2-m3

vllm serve Qwen/Qwen2.5-1.5B-Instruct --device cpu
vllm serve Qwen/Qwen2.5-1.5B-Instruct --enforce_eager
vllm serve Qwen/Qwen2.5-1.5B-Instruct --device cpu --enforce_eager
```

## 异常问题

- `ModuleNotFoundError: No module named 'torch'`

```bash
pip install torch
```

- for instructions on how to install GCC 5 or higher.

```bash
yum install centos-release-scl
yum install devtoolset-11-gcc devtoolset-11-gcc-c++
```
