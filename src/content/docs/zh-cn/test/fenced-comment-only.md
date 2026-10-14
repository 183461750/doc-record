```bash
# 这里是一段代码注释，不是标题
echo "fenced comment"
```

这篇文档故意让全文首个 `#` 出现在围栏代码块内，并且不声明 front matter、
正文也没有一级标题，用于验证标题推导不会把代码注释当成标题：
页面标题应回退为文件名（`fenced-comment-only`）。

```yaml
# YAML 注释同样不应被当作标题
key: value
```
