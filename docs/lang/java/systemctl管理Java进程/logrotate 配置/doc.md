# logrotate配置

[logrotate配置地址](https://github.com/183461750/doc-record/blob/main/docs/lang/java/systemctl%E7%AE%A1%E7%90%86Java%E8%BF%9B%E7%A8%8B/logrotate%20%E9%85%8D%E7%BD%AE/support-service)

## 你上面提到的第4点建议, 生产级的logrotate配置如何使用(AI答复)

针对Java应用日志的生产级`logrotate`配置，可以实现日志自动轮转、压缩、过期清理，避免日志文件过大占用磁盘空间。以下是针对你的`support-service`应用的完整配置方案：


### 1. 创建logrotate配置文件
在`/etc/logrotate.d/`目录下创建服务专属配置文件（以服务名命名，便于维护）：

```bash
sudo vim /etc/logrotate.d/support-service
```


### 2. 生产级配置内容
添加以下配置（针对`/var/log/support-service/`目录下的日志）：


    



### 3. 配置项说明（核心参数）
| 配置项                | 作用说明                                                                 |
|-----------------------|--------------------------------------------------------------------------|
| `daily`               | 每天自动轮转日志（结合`size`参数，达到100MB时会提前轮转）                |
| `rotate 30`           | 保留30份轮转日志（超过后自动删除最旧的，避免磁盘占满）                  |
| `size 100M`           | 单日志文件达到100MB时强制轮转（防止超大日志文件无法打开）               |
| `compress`            | 旧日志自动用gzip压缩（压缩率约70%，显著节省空间）                        |
| `delaycompress`       | 当天的旧日志不压缩（方便临时查看，第二天再压缩）                         |
| `create 0640 www www` | 轮转后创建新日志文件，权限为`640`，属主/属组为`www`（与应用一致）        |
| `postrotate`          | 轮转后执行的脚本：向Java进程发送`USR1`信号，通知应用切换到新日志文件    |


### 4. 关键注意事项（避免日志丢失）
- **Java应用日志切换支持**：  
  大部分Java日志框架（如Logback、Log4j2）默认支持`USR1`信号触发日志重新加载，无需重启应用。如果应用不支持，可改用`copytruncate`（但可能丢失少量日志）：  
  ```conf
  # 替代postrotate的方案（适合不支持USR1信号的应用）
  copytruncate  # 先复制日志内容到备份文件，再清空原文件（可能丢失复制期间的日志）
  ```

- **权限一致性**：  
  `create`参数需与应用运行的用户（`www`）一致，否则应用可能没有权限写入新日志文件。

- **测试配置有效性**：  
  配置后执行以下命令测试（不会实际轮转，仅输出执行计划）：  
  ```bash
  sudo logrotate -d /etc/logrotate.d/support-service
  ```
  手动触发一次轮转（用于验证）：  
  ```bash
  sudo logrotate -f /etc/logrotate.d/support-service
  ```


### 5. 日常维护
- 定期检查`/var/log/support-service/`目录，确认日志是否正常轮转、压缩。
- 根据磁盘空间和日志量，调整`rotate`（保留天数）和`size`（触发阈值）。
- 若需归档长期日志，可在`prerotate`中添加脚本，将日志同步到对象存储（如S3、OSS）。

通过这套配置，既能保证日志完整可用，又能避免磁盘空间被无限制占用，符合生产环境的稳定性要求。
