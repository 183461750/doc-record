# 记录

## 版本说明

- 将sqlite数据存储到nas中

```yaml
# 部分配置
services:
  nocobaseService:
    component: fc
    actions: # 自定义执行逻辑，关于actions 的使用，可以参考：https://www.serverless-devs.com/serverless-devs/yaml#行为描述
      post-deploy: # 在deploy之后运行
        - component: fc nas upload -ro /app/nocobase/storage/db /mnt/auto/nocobase/storage/db
        ...
```

## 开始使用

```shell
bash setup.sh
# 搞个git仓库将v2目录下的文件上传到git上
# 在FC中创建个应用，再创建环境时勾选允许访问vps和nas
```
