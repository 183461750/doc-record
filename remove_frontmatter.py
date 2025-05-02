#!/usr/bin/env python3
import os
import re

def remove_frontmatter(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 匹配Front Matter部分（以---开头和结尾的YAML块）
    pattern = r'^---\n.*?\n---\n'
    new_content = re.sub(pattern, '', content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Removed frontmatter from: {file_path}")

def process_directory(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.md') or file.endswith('.mdx'):
                remove_frontmatter(os.path.join(root, file))

if __name__ == '__main__':
    docs_dir = os.path.join(os.path.dirname(__file__), 'docs')
    process_directory(docs_dir)