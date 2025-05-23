# stun使用记录

```bash
docker run -it -p 54320:54320 python:3.9 bash
apt-get update && apt-get install -y stun-client
stun stun.l.google.com -p 54320
```

```bash
docker run -it --net host python:3.9 bash
docker run -it --network host python:3.9 bash
```
