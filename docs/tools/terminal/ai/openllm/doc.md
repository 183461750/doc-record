# openLLM

[GitHub地址](https://github.com/bentoml/OpenLLM)

## 安装

```bash
# or pip3 install openllm
pip install openllm
openllm hello

```

- 聊天界面

OpenLLM provides a chat UI at the /chat endpoint for the launched LLM server at http://localhost:3000/chat.

- 使用

```bash
openllm serve llama3.2:1b

openllm run llama3:8b
openllm model list
openllm repo update
openllm model get llama3.2:1b
```

- 添加模型

[GitHub地址](https://github.com/bentoml/openllm-models)

```bash
openllm repo add <repo-name> <repo-url>
openllm repo add nightly https://github.com/bentoml/openllm-models@nightly
```

- test

```bash
export VLLM_DEVICE=cpu
openllm serve gemma2:2b
```
