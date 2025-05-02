
# 编程语言相关记录

## Python

```bash
# 安装pip
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
sudo python get-pip.py
# 查看版本
pip --version

```

- 基本流程

```md
在项目根目录下创建虚拟环境：`python -m venv venv`
激活虚拟环境：
   - Linux/macOS: `source venv/bin/activate`
   - Windows: `venv\Scripts\activate`
确保已安装所有依赖：`pip install -r requirements.txt`
    - 如果安装失败，请手动安装依赖：`pip install requests`
    - 更新requirements.txt：`pip freeze > requirements.txt`
运行应用：`python main.py`
在浏览器中访问：`http://localhost:5000`
退出虚拟环境：`deactivate`

```
