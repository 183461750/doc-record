# mq

## rocketmq

[官方地址](https://rocketmq.apache.org/docs/quickStart/04quickstartWithHelmInKubernetes)

```bash
# Download RocketMQ Helm Chart
helm pull oci://registry-1.docker.io/apache/rocketmq --version 0.0.1 
tar -zxvf rocketmq-0.0.1.tgz


# Deploy RocketMQ
# Modify the configuration in values.yaml
vim values.yaml
## values.yaml, adjust memory requests and limits in broker resources according to available memory size ##
  resources:
    limits:
      cpu: 2
      memory: 10Gi
    requests:
      cpu: 2
      memory: 10Gi
##values.yaml##


helm install rocketmq-demo ./rocketmq
# Check pod status
# If the parameters are normal, it indicates successful deployment
kubectl get pods -o wide -n default
# NAME                                        READY   STATUS    RESTARTS       AGE    IP               NODE         NOMINATED NODE   READINESS GATES
# rocketmq-demo-broker-0                      1/1     Running   0              6h3m   192.168.58.225   k8s-node02   <none>           <none>
# rocketmq-demo-nameserver-757877747b-k669k   1/1     Running   0              6h3m   192.168.58.226   k8s-node02   <none>           <none>
# rocketmq-demo-proxy-6c569bd457-wcg6g        1/1     Running   0              6h3m   192.168.85.227   k8s-node01   <none>           <none>
```
