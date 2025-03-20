# ollama使用记录

[官网](https://ollama.com)

## 安装

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

- docker版(only CPU)

[docker hub地址](https://hub.docker.com/r/ollama/ollama)

```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

## 使用

```bash
ollama run BAAI/bge-reranker-v2-m3
```
