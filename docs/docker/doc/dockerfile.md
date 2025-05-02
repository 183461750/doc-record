
## dockerfile的构建命令查看(以zk镜像为示例)
```shell
# 查看构建过程的命令
docker history a10
# 可以查看到zk在使用dockerfile构建镜像时，设置了以下docker-entrypoint.sh文件中需要使用到的环境变量，相当于给了环境变量一个默认值，可在使用该镜像启动容器时修改
```
## docker-entrypoint.sh文件参考(来自zk容器)
```shell
#!/bin/bash

set -e

# Allow the container to be started with `--user`
if [[ "$1" = 'zkServer.sh' && "$(id -u)" = '0' ]]; then
    chown -R zookeeper "$ZOO_DATA_DIR" "$ZOO_DATA_LOG_DIR" "$ZOO_LOG_DIR"
    exec gosu zookeeper "$0" "$@"
fi

# Generate the config only if it doesn't exist
if [[ ! -f "$ZOO_CONF_DIR/zoo.cfg" ]]; then
    CONFIG="$ZOO_CONF_DIR/zoo.cfg"
    {
        echo "dataDir=$ZOO_DATA_DIR"
        echo "dataLogDir=$ZOO_DATA_LOG_DIR"

        echo "tickTime=$ZOO_TICK_TIME"
        echo "initLimit=$ZOO_INIT_LIMIT"
        echo "syncLimit=$ZOO_SYNC_LIMIT"

        echo "autopurge.snapRetainCount=$ZOO_AUTOPURGE_SNAPRETAINCOUNT"
        echo "autopurge.purgeInterval=$ZOO_AUTOPURGE_PURGEINTERVAL"
        echo "maxClientCnxns=$ZOO_MAX_CLIENT_CNXNS"
        echo "standaloneEnabled=$ZOO_STANDALONE_ENABLED"
        echo "admin.enableServer=$ZOO_ADMINSERVER_ENABLED"
    } >> "$CONFIG"
    if [[ -z $ZOO_SERVERS ]]; then
      ZOO_SERVERS="server.1=localhost:2888:3888;2181"
    fi

    for server in $ZOO_SERVERS; do
        echo "$server" >> "$CONFIG"
    done

    if [[ -n $ZOO_4LW_COMMANDS_WHITELIST ]]; then
        echo "4lw.commands.whitelist=$ZOO_4LW_COMMANDS_WHITELIST" >> "$CONFIG"
    fi

    for cfg_extra_entry in $ZOO_CFG_EXTRA; do
        echo "$cfg_extra_entry" >> "$CONFIG"
    done
fi

# Write myid only if it doesn't exist
if [[ ! -f "$ZOO_DATA_DIR/myid" ]]; then
    echo "${ZOO_MY_ID:-1}" > "$ZOO_DATA_DIR/myid"
fi

exec "$@"
```
