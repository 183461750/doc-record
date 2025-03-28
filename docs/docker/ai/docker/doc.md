# llm在docker中部署相关文档

[参考文章](https://www.docker.com/blog/llm-docker-for-local-and-hugging-face-hosting/)

## 示例

```bash
docker run -it -p 7860:7860 --platform=linux/amd64 \
    -e HUGGING_FACE_HUB_TOKEN="YOUR_VALUE_HERE"
\
    registry.hf.space/harsh-manvar-llama-2-7b-chat-test:latest python app.py

# 打开浏览器并转到 http://localhost:7860：
```

## 快速开始

```bash
git clone https://huggingface.co/spaces/harsh-manvar/llama-2-7b-chat-test
```

- Dockerfile

[Dockerfile来源](https://huggingface.co/spaces/harsh-manvar/llama-2-7b-chat-test/blob/main/Dockerfile)

```Dockerfile
FROM python:3.9
RUN useradd -m -u 1000 user
WORKDIR /code
COPY ./requirements.txt /code/requirements.txt
RUN pip install --upgrade pip
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
USER user
# 该 --link 标志指示 Docker 创建硬链接而不是复制文件，这可以提高性能并减小映像的大小。
COPY --link --chown=1000 ./ /code
```

```bash
docker buildx  build --platform=linux/amd64  -t local-llm:v1 .
```

```bash
docker run -it -p 7860:7860 --platform=linux/amd64 -e HUGGING_FACE_HUB_TOKEN="YOUR_VALUE_HERE" local-llm:v1 python app.py
```
