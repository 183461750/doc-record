以下是使用Docker Swarm部署Elasticsearch集群的步骤：

1. 环境准备：
   - 修改系统配置：在所有主机中，编辑`/etc/sysctl.conf`文件，并追加以下内容：`vm.max_map_count=262144`。保存后执行`sysctl -p`命令。
   - 创建专用网络：使用以下命令创建一个名为`elastic`的overlay网络：`docker network create --driver overlay elastic` [[1]](https://www.cnblogs.com/JentZhang/p/17047797.html)。

2. 准备docker-compose文件：
   - 创建一个名为`docker-compose-es-cluster.yml`的文件，内容如下：

```yaml
version: '3.3'
services:
  kibana:
    image: kibana:7.10.1
    environment:
      - ELASTICSEARCH_URL=http://es01:9200
      - ELASTICSEARCH_HOSTS=http://es01:9200
      - ELASTICSEARCH_USERNAME=elastic
      - ELASTICSEARCH_PASSWORD=vsUZGKNvjWRtTKPmDG
    ports:
      - "5601:5601"
    networks:
      - elastic
    deploy:
      mode: replicated
      replicas: 1
      resources:
        limits:
          memory: 800M
      placement:
        constraints:
          - node.labels.es.replica==1
  es01:
    image: elasticsearch:7.10.1
    hostname: es01
    environment:
      - network.publish_host=es01
      - network.host=0.0.0.0
      - node.name=es01
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es02,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - path.repo=/usr/share/elasticsearch/backups
      - xpack.security.enabled=false
      - xpack.security.audit.enabled=false
      - xpack.security.transport.ssl.enabled=false
      - ELASTIC_PASSWORD=vsUZGKNvjWRtTKPmDG
    volumes:
      - es01_data:/usr/share/elasticsearch/data
      - es01_logs:/usr/share/elasticsearch/logs
    ports:
      - "9200:9200"
    networks:
      - elastic
    deploy:
      mode: replicated
      replicas: 1
      resources:
        limits:
          cpus: "0.50"
          memory: 1G
        reservations:
          cpus: "0.25"
          memory: 1G
      placement:
        constraints:
          - node.labels.es.replica==1
  es02:
    image: elasticsearch:7.10.1
    hostname: es02
    environment:
      - network.publish_host=es02
      - network.host=0.0.0.0
      - node.name=es02
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - path.repo=/usr/share/elasticsearch/backups
    volumes:
      - es02_data:/usr/share/elasticsearch/data
      - es02_logs:/usr/share/elasticsearch/logs
    networks:
      - elastic
    deploy:
      mode: replicated
      replicas: 1
      resources:
        limits:
          cpus: "0.50"
          memory: 1G
        reservations:
          cpus: "0.25"
          memory: 1G
      placement:
        constraints:
          - node.labels.es.replica==2
  es03:
    image: elasticsearch:7.10.1
    hostname: es03
    environment:
      - network.publish_host=es03
      - network.host=0.0.0.0
      - node.name=es03
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es02
      - cluster.initial_master_nodes=es01,es02,es03
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - path.repo=/usr/share/elasticsearch/backups
    volumes:
      - es03_data:/usr/share/elasticsearch/data
      - es03_logs:/usr/share/elasticsearch/logs
    networks:
      - elastic
    deploy:
      mode: replicated
      replicas: 1
      resources:
        limits:
          cpus: "0.50"
          memory: 1G
        reservations:
          cpus: "0.以下是使用Docker Swarm部署Elasticsearch集群的步骤：

1. 环境准备：
   - 修改系统配置：在所有主机中，编辑`/etc/sysctl.conf`文件，并追加以下内容：`vm.max_map_count=262144`。保存后执行`sysctl -p`命令。
   - 创建专用网络：使用以下命令创建一个名为`elastic`的overlay网络：`docker network create --driver overlay elastic`。

2. 准备docker-compose文件：
   - 创建一个名为`docker-compose-es-cluster.yml`的文件，内容如下：

```yaml
version: '3.3'
services:
  kibana:
    image: kibana:7.10.1
    environment:
      - ELASTICSEARCH_URL=http://es01:9200
      - ELASTICSEARCH_HOSTS=http://es01:9200
      - ELASTICSEARCH_USERNAME=elastic
      - ELASTICSEARCH_PASSWORD=vsUZGKNvjWRtTKPmDG
    ports:
      - "5601:5601"
    networks:
      - elastic
    deploy:
      mode: replicated
      replicas: 1
      resources:
        limits:
          memory: 800M
      placement:
        constraints:
          - node.labels.es.replica==1
  es01:
    image: elasticsearch:7.10.1
    hostname: es01
    environment:
      - network.publish_host=es01
      - network.host=0.0.0.0
      - node.name=es01
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es02,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - path.repo=/usr/share/elasticsearch/backups
      - xpack.security.enabled=false
      - xpack.security.audit.enabled=false
      - xpack.security.transport.ssl.enabled=false
      - ELASTIC_PASSWORD=vsUZGKNvjWRtTKPmDG
    volumes:
      - es01_data:/usr/share/elasticsearch/data
      - es01_logs:/usr/share/elasticsearch/logs
    ports:
      - "9200:9200"
    networks:
      - elastic
    deploy:
      mode: replicated
      replicas: 1
      resources:
        limits:
          cpus: "0.50"
          memory: 1G
        reservations:
          cpus: "0.25"
          memory: 1G
      placement:
        constraints:
          - node.labels.es.replica==1
  es02:
    image: elasticsearch:7.10.1
    hostname: es02
    environment:
      - network.publish_host=es02
      - network.host=0.0.0.0
      - node.name=es02
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - path.repo=/usr/share/elasticsearch/backups
    volumes:
      - es02_data:/usr/share/elasticsearch/data
      - es02_logs:/usr/share/elasticsearch/logs
    networks:
      - elastic
    deploy:
      mode: replicated
      replicas: 1
      resources:
        limits:
          cpus: "0.50"
          memory: 1G
        reservations:
          cpus: "0.25"
          memory: 1G
      placement:
        constraints:
          - node.labels.es.replica==2
  es03:
    image: elasticsearch:7.10.1
    hostname: es03
    environment:
      - network.publish_host=es03
      - network.host=0.0.0.0
      - node.name=es03
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es02
      - cluster.initial_master_nodes=es01,es02,es03
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - path.repo=/usr/share/elasticsearch/backups
    volumes:
      - es03_data:/usr/share/elasticsearch/data
      - es03_logs:/usr/share/elasticsearch/logs
    networks:
      - elastic
    deploy:
      mode: replicated
      replicas: 1
      resources:
        limits:
          cpus: "0.50"
          memory: 1G
        reservations:
          cpus: "0.25"

---
Learn more:
1. [docker swarm 搭建ES集群 - JentZhang - 博客园](https://www.cnblogs.com/JentZhang/p/17047797.html)
2. [docker swarm 搭建ES集群（TLS版） - JentZhang - 博客园](https://www.cnblogs.com/JentZhang/p/17227129.html)
3. [docker swarm es 集群-掘金](https://juejin.cn/s/docker%20swarm%20es%20%E9%9B%86%E7%BE%A4)