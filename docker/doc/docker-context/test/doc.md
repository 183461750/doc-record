# 测试

```bash
docker context create k8s-test \
  --default-stack-orchestrator=kubernetes \
  --kubernetes config-file=~/.kube/config \
  --docker host=ssh://root@23.internet.company
```
