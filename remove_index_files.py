import os
import sys

def remove_index_files(directory):
    """
    递归删除目录中的所有index.md和index.markdown文件
    """
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower() in ('index.md', 'index.markdown'):
                file_path = os.path.join(root, file)
                try:
                    os.remove(file_path)
                    print(f"已删除: {file_path}")
                except Exception as e:
                    print(f"删除失败 {file_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python remove_index_files.py <目录路径>")
        sys.exit(1)
    
    target_dir = sys.argv[1]
    if not os.path.isdir(target_dir):
        print(f"错误: {target_dir} 不是有效目录")
        sys.exit(1)
        
    print(f"开始扫描目录: {target_dir}")
    remove_index_files(target_dir)
    print("操作完成")