#!/usr/bin/env ruby
require 'yaml'
require 'fileutils'

class DocOrganizer
  def initialize(docs_dir)
    @docs_dir = docs_dir
    @nav_order = {}
  end

  def organize
    # 1. 处理所有doc.md文件
    process_doc_files
    
    # 2. 更新front matter
    update_front_matter
  end

  private

  def process_doc_files
    Dir.glob(File.join(@docs_dir, '**', '*.md')).each do |file|
      next if file.end_with?('index.md')
      
      relative_path = file.sub(@docs_dir + '/', '')
      dir_path = File.dirname(relative_path)
      
      # 确保每个层级都有 index.md
      create_parent_indexes(dir_path)
      
      # 更新文档的 front matter
      update_doc_front_matter(file, dir_path)
    end
  end

  def create_parent_indexes(dir_path)
    return if dir_path == '.'
    
    parts = dir_path.split('/')
    current_path = ''
    
    parts.each_with_index do |part, index|
      current_path = current_path.empty? ? part : File.join(current_path, part)
      full_path = File.join(@docs_dir, current_path)
      
      # 创建当前层级的 index.md
      index_path = File.join(full_path, 'index.md')
      next if File.exist?(index_path)
      
      # 获取父级目录
      parent_path = index.zero? ? nil : parts[0...index].join('/')
      
      # 创建 index.md
      title = part.split('_').map(&:capitalize).join(' ')
      create_index_md(full_path, title, index + 1, current_path, parent_path)
    end
  end

  def create_index_md(path, title, order, dir, parent = nil)
    index_path = File.join(path, 'index.md')
    return if File.exist?(index_path)

    permalink = "/#{dir}/"
    content = "---\n"
    content += "layout: default\n"
    content += "title: #{title}\n"
    content += "nav_order: #{order}\n"
    content += "has_children: true\n"
    content += "parent: #{parent.split('_').map(&:capitalize).join(' ')}\n" if parent
    content += "permalink: #{permalink}\n"
    content += "---\n\n"
    content += "# #{title}\n"

    File.write(index_path, content)
  end

  def update_doc_front_matter(file, dir_path)
    content = File.read(file)
    if content =~ /^(---\s*\n.*?\n?)^(---\s*$\n?)/m
      front_matter = YAML.load($1)
      remaining_content = content[$1.length + $2.length..-1]
      
      # 更新 front matter
      front_matter['layout'] ||= 'default'
      front_matter['has_children'] = false
      
      # 设置父级页面
      if dir_path != '.'
        parts = dir_path.split('/')
        parent_dir = parts[-1]
        front_matter['parent'] = parent_dir.split('_').map(&:capitalize).join(' ')
        
        # 如果有多于一级的目录，设置 grand_parent
        if parts.length > 1
          grand_parent_dir = parts[-2]
          front_matter['grand_parent'] = grand_parent_dir.split('_').map(&:capitalize).join(' ')
        end
      end
      
      # 更新文件
      new_content = "---\n#{front_matter.to_yaml}---\n#{remaining_content}"
      File.write(file, new_content)
    end
  end

  def update_front_matter
    Dir.glob(File.join(@docs_dir, '**', '*.md')).each do |file|
      content = File.read(file)
      
      # 提取现有的 front matter
      if content =~ /^---\s*\n(.*?)\n---\s*$/m
        yaml_content = $1
        rest_content = content.sub(/^---\s*\n.*?\n---\s*\n/m, '')
        
        begin
          front_matter = YAML.load(yaml_content) || {}
        rescue
          front_matter = {}
        end
        
        # 更新 front matter
        front_matter['layout'] = 'default'
        front_matter['has_children'] = false if front_matter['has_children'].nil?
        
        # 设置 parent 字段
        parent_title = get_parent_dir(file)
        front_matter['parent'] = parent_title if parent_title
        
        # 处理 title，确保没有多余的引号
        if front_matter['title']
          front_matter['title'] = front_matter['title'].to_s.gsub(/^["']|["']$/, '')
        end
        
        # 生成规范的 permalink
        rel_path = file.sub(@docs_dir, '').sub(/^\//, '').sub(/\.md$/, '').sub(/\/index$/, '')
        front_matter['permalink'] = rel_path.empty? ? "/" : "/#{rel_path.downcase}/"
        
        # 如果没有 nav_order，根据目录深度和名称生成
        if front_matter['nav_order'].nil?
          depth = rel_path.count('/')
          @nav_order[depth] ||= 0
          @nav_order[depth] += 1
          front_matter['nav_order'] = @nav_order[depth]
        end
        
        # 生成新的文件内容
        new_content = "---\n#{front_matter.to_yaml.sub(/^---\n/, '')}---\n\n#{rest_content}"
        File.write(file, new_content)
      end
    end
  end

  def get_parent_dir(file)
    rel_path = file.sub(@docs_dir, '').sub(/^\//, '')
    parts = rel_path.split('/')
    return nil if parts.length <= 1
    
    # 如果文件在根目录下且不在主要目录中，则设置 parent 为 "素材库"
    if parts.length == 1 && !%w[docker kubernetes middleware os tools network ai books materiel lang].include?(parts[0])
      return "素材库"
    end
    
    parent_path = parts[0..-2].join('/')
    # 查找父目录中的 index.md 文件
    parent_index = File.join(@docs_dir, parent_path, 'index.md')
    if File.exist?(parent_index)
      content = File.read(parent_index)
      if content =~ /^---\s*\n(.*?)\n---\s*$/m
        front_matter = YAML.load($1) rescue {}
        return front_matter['title'] if front_matter['title']
      end
    end
    nil
  end
end

if __FILE__ == $0
  docs_dir = File.expand_path('../../_docs', __FILE__)
  organizer = DocOrganizer.new(docs_dir)
  organizer.organize
end
