# netbird使用

- [官方地址](https://app.netbird.io)

- 使用docker安装

```bash
docker run --rm -d \
   --cap-add=NET_ADMIN \
   -e NB_SETUP_KEY=SETUP_KEY \
   -v netbird-client:/etc/netbird \
   netbirdio/netbird:latest
# https://docs.netbird.io/how-to/getting-started#running-net-bird-in-docker
```
