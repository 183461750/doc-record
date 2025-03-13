#!/usr/bin/env python3
import os
from pathlib import Path

def get_markdown_title(file_path):
    """从markdown文件中获取标题"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            # 尝试获取第一个 # 开头的行作为标题
            for line in content.split('\n'):
                if line.startswith('# '):
                    return line[2:].strip()
    except:
        pass
    # 如果没有找到标题，返回文件名
    return os.path.splitext(os.path.basename(file_path))[0]

def process_directory(dir_path, base_path, level=0):
    """递归处理目录及其子目录"""
    result = []
    indent = '    ' * level
    has_content = False

    # 处理当前目录下的 README.md/index.md
    index_files = ['README.md', 'index.md']
    has_index = False
    for index_file in index_files:
        index_path = dir_path / index_file
        if index_path.exists():
            title = get_markdown_title(index_path)
            # 使用以 / 开头的路径
            relative_path = os.path.relpath(index_path, base_path)
            relative_path = '/' + relative_path.replace('\\', '/')
            result.append(f'{indent}- [{title}]({relative_path})')
            has_index = True
            has_content = True
            break

    # 获取所有子目录，忽略下划线开头的目录
    dirs = [d for d in dir_path.iterdir() if d.is_dir() and not d.name.startswith('.') and not d.name.startswith('_')]
    dirs.sort(key=lambda x: x.name.lower())

    # 获取当前目录下的所有markdown文件，忽略下划线开头的文件
    md_files = []
    for ext in ('*.md', '*.markdown'):
        md_files.extend(dir_path.glob(ext))
    md_files = [f for f in md_files if f.name.lower() not in ['readme.md', 'index.md', '_sidebar.md'] and not f.name.startswith('_')]
    md_files.sort(key=lambda x: x.name.lower())
    
    if md_files:
        has_content = True

    # 处理子目录
    sub_dir_results = []
    for sub_dir in dirs:
        # 递归处理子目录
        sub_content = process_directory(sub_dir, base_path, level + 1)
        
        # 只有当子目录有内容时才添加
        if sub_content:
            # 添加目录标题
            dir_name = sub_dir.name
            sub_dir_results.append(f'{indent}- {dir_name}')
            sub_dir_results.extend(sub_content)
            has_content = True
    
    result.extend(sub_dir_results)

    # 处理markdown文件
    for md_file in md_files:
        title = get_markdown_title(md_file)
        # 使用以 / 开头的路径
        relative_path = os.path.relpath(md_file, base_path)
        relative_path = '/' + relative_path.replace('\\', '/')
        result.append(f'{indent}- [{title}]({relative_path})')

    # 如果是根目录，即使没有内容也返回结果
    if level == 0 or has_content:
        return result
    else:
        return []

def generate_sidebar(docs_dir):
    """生成侧边栏内容"""
    base_path = Path(docs_dir)
    
    # 处理根目录
    sidebar_content = process_directory(base_path, base_path)
    
    return '\n'.join(sidebar_content)

def main():
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    docs_dir = os.path.join(script_dir, 'docs')
    
    # 生成侧边栏内容
    sidebar_content = generate_sidebar(docs_dir)
    
    # 写入_sidebar.md文件
    sidebar_path = os.path.join(docs_dir, '_sidebar.md')
    with open(sidebar_path, 'w', encoding='utf-8') as f:
        f.write(sidebar_content)
    
    print(f'Successfully generated {sidebar_path}')

if __name__ == '__main__':
    main()
