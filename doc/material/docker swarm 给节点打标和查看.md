# docker swarm 给节点打标和查看

要给Docker Swarm节点添加标签并查看标签，可以使用以下步骤：

1. 添加标签：
   - 在管理节点上运行以下命令来给节点添加标签：
  
     ```shell
     docker node update --label-add <key>=<value> <node-id>
     ```

     这里的`<key>`是标签的键，`<value>`是标签的值，`<node-id>`是要添加标签的节点的ID。例如，要给节点ID为`node1`的节点添加标签`environment=production`，可以运行以下命令：

     ```shell
     docker node update --label-add environment=production node1
     ```

   - 重复上述步骤，为其他节点添加标签。

2. 查看标签：
   - 运行以下命令来查看所有节点的标签：
  
     ```shel
     docker node ls --format "{{.ID}}: {{.Hostname}} [{{.Status}}] Labels: {{.Labels}}"
     ```

     这将显示每个节点的ID、主机名、状态和标签。

   - 若要查看特定节点的标签，可以运行以下命令：
  
     ```shell
     docker node inspect --format "{{.Spec.Labels}}" <node-id>
     ```

     这里的`<node-id>`是要查看标签的节点的ID。例如，要查看节点ID为`node1`的节点的标签，可以运行以下命令：

     ```shell
     docker node inspect --format "{{.Spec.Labels}}" node1
     ```

这样，您就可以给Docker Swarm节点添加标签并查看标签了。

---
Learn more:

1. [Manage nodes in a swarm - Docker Docs](https://docs.docker.com/engine/swarm/manage-nodes/)
2. [How to list docker swarm nodes with labels - Stack Overflow](https://stackoverflow.com/questions/42414703/how-to-list-docker-swarm-nodes-with-labels)
3. [Docker swarm - How to use node labels | by Konstantinos Patronas | LinuxStories | Medium](https://medium.com/linuxstories/docker-swarm-how-to-use-node-labels-a1b62314e4b5)
