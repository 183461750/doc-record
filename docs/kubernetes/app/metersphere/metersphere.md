
# metersphere使用

## k8s部署

```bash
kubectl create ns ms
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add metersphere https://metersphere.github.io/helm-chart/
# 从 chart 仓库中更新本地可用chart的信息
helm repo update  
helm install metersphere metersphere/metersphere -n ms

# 创建 Node Port 访问方式
## 使用命令 kubectl get svc -n ms 可查看 metersphere-gateway 所占用的端口号。如果不使用 ingress 的访问方式，可以创建一个 nodeport。

vi ms-gateway-nodeport.yaml

apiVersion: v1
kind: Service
metadata:
  name: metersphere-gateway-nodeport
  namespace: ms
spec:
  ports:
    - name: metersphere-gateway
      protocol: TCP
      port: 8000
      targetPort: 8000
      nodePort: 30801
  type: NodePort
  selector:
    app: metersphere-gateway

kubectl create -f ms-gateway-nodeport.yaml 
访问 MeterSphere 页面: http://nodeIP:30801

```
