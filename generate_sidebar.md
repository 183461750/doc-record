# 自动生成侧边栏

Docsify 本身并没有内置直接根据目录结构自动生成 _sidebar.md 文件的功能。它的默认行为是通过配置文件（如 index.html 中的 window.$docsify）手动指定侧边栏内容，或者通过 _sidebar.md 文件手动编写。然而，社区和用户提出了一些方法和工具，可以实现动态根据目录结构生成 _sidebar.md 的需求。以下是一些可行的解决方案：

## 方法一：使用外部脚本手动生成

你可以通过编写一个简单的脚本（例如使用 Python、Bash 或 Node.js），遍历目录结构并生成 _sidebar.md 文件。这种方法需要手动运行脚本或集成到构建流程中。
示例：Python 脚本
以下是一个简单的 Python 脚本示例，可以根据 docs 文件夹中的 Markdown 文件生成 _sidebar.md：

```python
import os

def generate_sidebar(directory="docs", output_file="_sidebar.md"):
    sidebar_content = ["* [Home](/)\n"]  # 默认首页
    for root, dirs, files in os.walk(directory):
        for file in sorted(files):
            if file.endswith(".md") and file != "README.md":
                # 获取相对路径并转换为链接格式
                rel_path = os.path.relpath(os.path.join(root, file), directory).replace("\\", "/")
                name = file[:-3]  # 去掉 .md 后缀
                sidebar_content.append(f"* [{name}](/{rel_path})\n")
    
    # 写入 _sidebar.md 文件
    with open(output_file, "w", encoding="utf-8") as f:
        f.writelines(sidebar_content)

# 执行脚本
generate_sidebar()
```

使用方法：
将脚本保存为 generate_sidebar.py。
确保你的 Markdown 文件都在 docs 文件夹中。
运行脚本：python generate_sidebar.py。
在 index.html 中配置 loadSidebar: true，以启用侧边栏：

```html
<script>
  window.$docsify = {
    loadSidebar: true
  }
</script>
```

优点与局限：
优点：简单易懂，可自定义。
局限：需要手动运行脚本，无法实时更新。

## 方法二：使用 Docsify 插件或工具

社区提供了一些工具，可以帮助实现动态生成侧边栏。例如 docsify-tools，其中包含一个 docsify-auto-sidebar 工具。
安装与使用：
全局安装 docsify-tools：

```bash
npm i -g docsify-tools
```

在项目根目录运行命令，指定目标目录（例如 docs）：

```bash
docsify-auto-sidebar -d docs
```

这会根据 docs 文件夹的结构自动生成 _sidebar.md 文件。
在 index.html 中启用侧边栏：

```html
<script>
  window.$docsify = {
    loadSidebar: true
  }
</script>
```

优点与局限：
优点：集成到 Docsify 生态，操作方便。
局限：需要安装 Node.js 环境，且仍需手动运行命令。

## 方法三：结合 Docsify CLI 和自定义逻辑

如果你使用 docsify-cli，可以通过扩展其功能来实现自动生成。例如，在初始化项目时添加自定义脚本。
示例步骤：
安装 docsify-cli：

```bash
npm i -g docsify-cli
```

初始化项目并添加侧边栏：

```bash
docsify init ./docs --sidebar true
```

编写一个脚本（如上述 Python 脚本），并将其集成到工作流中（例如通过 package.json 的 scripts）：

```json
{
  "scripts": {
    "generate-sidebar": "python generate_sidebar.py",
    "serve": "npm run generate-sidebar && docsify serve docs"
  }
}
```

运行服务：

```bash
npm run serve
```

优点与局限：
优点：可集成到开发流程中。
局限：需要额外的脚本支持。

## 方法四：社区提议的自动生成功能（未实现）

在 Docsify 的 GitHub 仓库中（如 Issue #1290），有用户提议增加自动生成侧边栏的功能，但截至 2025 年 3 月 12 日，这一功能尚未被官方实现。提议的思路是通过扫描目录结构生成树状结构，然后输出到 _sidebar.md。你可以关注 Docsify 的官方仓库，查看是否有相关更新。
总结与建议
目前，Docsify 不支持开箱即用的动态生成 _sidebar.md，但通过以下方式可以实现：
推荐方案：使用 docsify-auto-sidebar 工具，简单高效。
灵活方案：编写自定义脚本（如 Python），并结合构建流程。
长期关注：等待 Docsify 官方可能推出的内置支持。
如果你需要实时动态更新（例如文件变动时自动生成），可以结合文件监听工具（如 watch 或 nodemon）与上述脚本一起使用。例如：

```bash
nodemon -e md --exec "python generate_sidebar.py"
```

希望这些方法能帮到你！如果有进一步需求，可以告诉我，我会尽力提供更具体的帮助。
