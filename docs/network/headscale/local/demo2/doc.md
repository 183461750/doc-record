# headscale docker compose版使用记录

```bash
# 端口8888是服务端口(通过cpolar代理8888端口 -> https://5d37b78.r3.cpolar.top)
# 在macos的tailscale客户端上使用headscale作为控制服务器(按option按钮, 点击tailscale图标, 选择debug->Custom Login Server->Add Account...->输入https://5d37b78.r3.cpolar.top-> 然后会自动打开浏览器-> 复制key-> 到服务端的服务器去->执行以下命令)
docker exec -it headscale headscale user create USERNAME
docker exec -it headscale headscale nodes register --user USERNAME --key qWrn3RY86bXG5BAcik7V7MoX
```

```bash
# linux客户端(可以在服务端那台电脑上使用, 用来连接服务端)
docker exec -it headscale headscale user create fa.ssy 
docker exec -it headscale headscale preauthkeys create -e 24h --user fa.ssy 
# 将上面生成的key复制到下面的命令中
tailscale up --accept-dns=true --accept-routes --login-server=http://127.0.0.1:8888 --hostname=fa.ssy --force-reauth  --authkey d69d58c009190358df704e7b3d867c1be0b022c038bc89be
```
