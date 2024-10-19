# doc-record

## 介绍

记录一些文档, 关于docker, k8s, 以及一些其他工具的文档.

## github pages

### 自定义host

[github设置路径](https://github.com/183461750/doc-record/settings/actions/runners/new?arch=arm64&os=osx)

> PS: 以下命令均在项目根目录下操作的

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
