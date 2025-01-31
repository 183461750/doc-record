---
layout: "default"
title: "timedatectl命令怎么同步网络时间"
nav_order: 15
description: "timedatectl命令怎么同步网络时间"
parent: "ai"
has_children: false
permalink: "/docker/doc/material/ai/os/timedatectl命令怎么同步网络时间/"
---

# timedatectl命令怎么同步网络时间

要使用`timedatectl`命令同步网络时间，您可以按照以下步骤操作：

1. 检查当前时间同步状态：
   - 在终端中运行以下命令来查看当前时间同步状态：`timedatectl status` [[1]](https://tecadmin.net/synchronizing-a-linux-system-clock-with-ntp-server/).
   - 检查输出中的 "System clock synchronized" 字段，如果显示为 "yes"，则表示时间已经同步。

2. 启用网络时间同步：
   - 在终端中运行以下命令来启用网络时间同步：`sudo timedatectl set-ntp true` [[1]](https://tecadmin.net/synchronizing-a-linux-system-clock-with-ntp-server/).
   - 这将启用系统与网络时间协议（NTP）服务器的自动时间同步。

3. 检查时间同步状态：
   - 再次运行 `timedatectl status` 命令来检查时间同步状态 [[1]](https://tecadmin.net/synchronizing-a-linux-system-clock-with-ntp-server/).
   - 确保 "System clock synchronized" 字段显示为 "yes"，表示时间已成功同步。

---
Learn more:

1. [Synchronizing a Linux System Clock with NTP Server](https://tecadmin.net/synchronizing-a-linux-system-clock-with-ntp-server/)
2. [How to Set Time, Timezone and Synchronize System Clock Using timedatectl Command](https://www.tecmint.com/set-time-timezone-and-synchronize-time-using-timedatectl-command/)
3. [systemd - How to sync the time to network with timedatectl on Ubuntu 18.04? - Ask Ubuntu](https://askubuntu.com/questions/1058593/how-to-sync-the-time-to-network-with-timedatectl-on-ubuntu-18-04)
