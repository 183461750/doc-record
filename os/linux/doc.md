# linux系统文档

```bash
# 获取系统IP
hostname -I | cut -f1 -d' '
# 关机
# sshpass -p root ssh -o "StrictHostKeyChecking=no" root@$(hostname -I | cut -f1 -d' ') "sudo poweroff"
sshpass -p root ssh -o StrictHostKeyChecking=no root@10.0.16.16 sudo poweroff
```
