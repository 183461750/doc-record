# wren ai

[github地址](https://github.com/Canner/WrenAI)

## 安装

```bash
# macos
curl -L https://github.com/Canner/WrenAI/releases/latest/download/wren-launcher-darwin.tar.gz | tar -xz && ./wren-launcher-darwin
# config.yaml
wget -O config.example.yaml https://raw.githubusercontent.com/canner/WrenAI/0.13.2/docker/config.example.yaml && \
mkdir -p ~/.wrenai && cp config.example.yaml ~/.wrenai/config.yaml
# .env
wget -O .env.example https://raw.githubusercontent.com/canner/WrenAI/0.13.2/docker/.env.example && \
mkdir -p ~/.wrenai && cp .env.example ~/.wrenai/.env
```

[自定义llm文档](https://docs.getwren.ai/oss/installation/custom_llm#running-wren-ai-with-your-custom-llm-embedder-or-document-store)

> 先记录, 暂时不搞了, 配置太麻烦了
