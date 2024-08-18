# telegraf是用记录

[相关资料1](https://github.com/influxdata/sandbox.git)
[相关资料2](https://github.com/LinShunKang/MyPerf4J/wiki/Telegraf_)

## 简单运行

```bash
docker run -d --name=telegraf \
    -v $PWD/conf/telegraf.conf:/etc/telegraf/telegraf.conf:ro \
    -v /tmp/MyPerf4J/data/logs/MyPerf4J:/tmp/MyPerf4J/data/logs/MyPerf4J:ro \
    telegraf
```
