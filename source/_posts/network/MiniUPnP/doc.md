# MiniUPnP工具使用记录

[github地址](https://github.com/miniupnp/miniupnp)

```bash
# 安装
brew install miniupnpc
# 验证
upnpc --version
```

```bash
# 基础使用示例

# 查看当前NAT类型：
upnpc -s
# - 输出中若显示`PortMappingEnabled: 1`表示UPnP已启用。  

# 添加端口映射（如将内网5000端口映射到公网6000）：
upnpc -a 192.168.1.100 5000 6000 TCP 
# - `192.168.1.100`为本地设备IP，`TCP`可替换为`UDP`。  

# 删除映射规则：
upnpc -d 6000 TCP 

# 常见问题与解决
# 路由器兼容性：部分路由器需手动开启UPnP功能（如OpenWrt需安装miniupnpd软件包）5。
# 端口冲突：映射前通过upnpc -l检查端口占用情况。

# 扩展应用场景
# BitTorrent优化：结合qBittorrent等客户端，提升下载速度。
# 远程开发调试：映射SSH或Web服务端口至公网，实现远程访问。
# 游戏联机支持：解决NAT类型限制，改善联机体验（如Minecraft服务器搭建）。
# 若需高级功能（如持久化配置），可参考 [官方文档](https://github.com/miniupnp/miniupnp) 进一步配置。
```
