# headscale docker compose版使用记录

```bash
# 端口8888是服务端口(通过cpolar代理8888端口 -> https://5d37b78.r3.cpolar.top)
# 在macos的tailscale客户端上使用headscale作为控制服务器(按option按钮, 点击tailscale图标, 选择debug->Custom Login Server->Add Account...->输入https://5d37b78.r3.cpolar.top-> 然后会自动打开浏览器-> 复制key-> 到服务端的服务器去->执行以下命令)
docker exec -it headscale headscale user create USERNAME
docker exec -it headscale headscale nodes register --user USERNAME --key qWrn3RY86bXG5BAcik7V7MoX
```
