# docker swarm 给节点打标和查看和移除

要给Docker Swarm节点添加、查看和移除标签，可以按照以下步骤进行操作：

1. 添加标签：
   - 在管理节点上运行以下命令来给节点添加标签：

     ```shell
     docker node update --label-add <key>=<value> <node-id>
     ```

     这里的`<key>`是标签的键，`<value>`是标签的值，`<node-id>`是要添加标签的节点的ID [[1]](https://docs.docker.com/engine/swarm/manage-nodes/)。
     例如，要给节点ID为`node1`的节点添加标签`environment=production`，可以运行以下命令：

     ```shell
     docker node update --label-add environment=production node1
     ```

   - 重复上述步骤，为其他节点添加标签。

2. 查看标签：
   - 运行以下命令来查看所有节点的标签：

     ```shell
     docker node ls --format "{{.ID}}: {{.Hostname}} [{{.Status}}] Labels: {{.Labels}}"
     ```

     这将显示每个节点的ID、主机名、状态和标签 [[2]](https://medium.com/linuxstories/docker-swarm-how-to-use-node-labels-a1b62314e4b5)。

   - 若要查看特定节点的标签，可以运行以下命令：

     ```shell
     docker node inspect --format "{{.Spec.Labels}}" <node-id>
     ```

     这里的`<node-id>`是要查看标签的节点的ID。
     例如，要查看节点ID为`node1`的节点的标签，可以运行以下命令：

     ```shell
     docker node inspect --format "{{.Spec.Labels}}" node1
     ```

3. 移除标签：
   - 在管理节点上运行以下命令来移除节点的标签：

     ```shell
     docker node update --label-rm <key> <node-id>
     ```

     这里的`<key>`是要移除的标签的键，`<node-id>`是要移除标签的节点的ID。
     例如，要移除节点ID为`node1`的节点的标签`environment`，可以运行以下命令：

     ```shell
     docker node update --label-rm environment node1
     ```

这样，您就可以给Docker Swarm节点添加、查看和移除标签了。

---
Learn more:

1. [Manage nodes in a swarm - Docker Docs](https://docs.docker.com/engine/swarm/manage-nodes/)
2. [Docker swarm - How to use node labels | by Konstantinos Patronas | LinuxStories | Medium](https://medium.com/linuxstories/docker-swarm-how-to-use-node-labels-a1b62314e4b5)
3. [How to list docker swarm nodes with labels - Stack Overflow](https://stackoverflow.com/questions/42414703/how-to-list-docker-swarm-nodes-with-labels)
