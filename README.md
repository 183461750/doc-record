# doc-record

## 介绍

记录一些文档, 关于docker, k8s, 以及一些其他工具的文档.

## 安装

```bash
npx create-docusaurus@latest doc-record classic
cd doc-record
npm install
npm run start
```

- 生成侧边栏
  - [相关文档](./generate_sidebar.md)
    - 目前使用方法三

```bash
# 启动项目
npm run start
```

## github pages

### 自定义host

[github设置路径](https://github.com/183461750/doc-record/settings/actions/runners/new?arch=arm64&os=osx)

> PS: 以下命令均在项目根目录下操作的(别再根目录操作了, 文件太多, 系统都要卡住了...)

Download

```bash
# Create a folder
$ mkdir actions-runner && cd actions-runner
Copied!# Download the latest runner package
$ curl -o actions-runner-osx-arm64-2.320.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.320.0/actions-runner-osx-arm64-2.320.0.tar.gz
Copied! # Optional: Validate the hash
$ echo "14e2600c07ad76a1c9f6d9e498edf14f1c63f7f7f8d55de0653e450f64caa854  actions-runner-osx-arm64-2.320.0.tar.gz" | shasum -a 256 -c
Copied! # Extract the installer
$ tar xzf ./actions-runner-osx-arm64-2.320.0.tar.gz
```

Configure

```bash
# Create the runner and start the configuration experience
$ ./config.sh --url https://github.com/183461750/doc-record --token AJCNPVOFCKIXJHNU4XPGEX3HCO3O4
Copied!# Last step, run it!
$ ./run.sh
```

Using your self-hosted runner

```bash
# Use this YAML in your workflow file for each job
runs-on: self-hosted
```

## 使用到的vscode插件

- eliostruyf.vscode-front-matter-beta

## 人机协作指南

### 内容创作者（人类）

```bash
1. 专注在_docs目录编写Markdown
2. 使用分类文件夹组织文档
3. 保持Front Matter简洁
```

### AI开发助手

```bash
1. 维护_docs目录结构稳定性
2. 自动优化知识呈现方式
3. 确保所有文档URL永久可用
```

## 备注

- vscode搜索

```bash
# 需要排除的搜索项

# 如果只是想排除 所有以 . 开头的文件和目录，最简单的写法是：
**/.*
# 但如果某些 .xxx 文件需要保留，可以结合 ! 排除规则：
**/.*, !./.some-important-dot-file

## 写入项目的 .vscode/settings.json 文件，这样只有当前项目会应用这些排除规则，而不会影响其他项目或全局设置。
{
    "search.exclude": {
        "**/node_modules": true,
        "**/.*": true,  // 排除所有以 . 开头的文件和目录
        // 加了下面这个, temp目录下的文件还是不能被搜索到
        // "!**/temp/**": true,  // 允许搜索所有 temp 文件夹（默认允许）
    },
    "search.useIgnoreFiles": false  // 关闭忽略文件的影响
}

```

## TODO

- 接入AI搜索
  - [参考页面](https://docs.orama.com/cloud/data-sources/native-integrations/docusaurus)
