#!/usr/bin/env ruby
require 'yaml'
require 'fileutils'

class DocOrganizer
  def initialize(docs_dir)
    @docs_dir = docs_dir
    @nav_order = {}
  end

  def organize
    # 1. 创建主要目录的index.md
    create_main_indexes
    
    # 2. 处理所有doc.md文件
    process_doc_files
    
    # 3. 更新front matter
    update_front_matter
  end

  private

  def create_main_indexes
    main_dirs = {
      '' => {title: '首页', order: 1},
      'docker' => {title: 'Docker', order: 2},
      'kubernetes' => {title: 'Kubernetes', order: 3},
      'middleware' => {title: '中间件', order: 4},
      'os' => {title: '操作系统', order: 5},
      'tools' => {title: '工具集', order: 6},
      'network' => {title: '网络', order: 7},
      'ai' => {title: 'AI', order: 8},
      'books' => {title: '资料', order: 9},
      'materiel' => {title: '素材库', order: 10}
    }

    main_dirs.each do |dir, info|
      path = File.join(@docs_dir, dir)
      FileUtils.mkdir_p(path) unless dir.empty?
      
      create_index_md(path, info[:title], info[:order], dir)
    end
  end

  def create_index_md(path, title, order, dir)
    index_path = File.join(path, 'index.md')
    return if File.exist?(index_path)

    # 生成规范的 permalink
    permalink = dir.empty? ? "/" : "/#{dir.downcase}/"

    content = <<~MARKDOWN
    ---
    layout: default
    title: #{title}
    nav_order: #{order}
    has_children: true
    permalink: #{permalink}
    ---

    # #{title}

    这里包含了#{title}相关的所有文档。
    MARKDOWN

    File.write(index_path, content)
  end

  def process_doc_files
    Dir.glob(File.join(@docs_dir, '**', 'doc.md')).each do |file|
      dir_name = File.basename(File.dirname(file))
      new_name = File.join(File.dirname(file), "#{dir_name}.md")
      
      # 如果文件存在且内容不同，则重命名为其他名称
      if File.exist?(new_name) && !FileUtils.identical?(file, new_name)
        new_name = File.join(File.dirname(file), "#{dir_name}_guide.md")
      end
      
      FileUtils.mv(file, new_name) unless file == new_name
    end
  end

  def get_parent_dir(file)
    rel_path = file.sub(@docs_dir, '').sub(/^\//, '')
    parts = rel_path.split('/')
    return nil if parts.length <= 1
    
    # 如果文件在根目录下且不在主要目录中，则设置 parent 为 "素材库"
    if parts.length == 1 && !%w[docker kubernetes middleware os tools network ai books materiel].include?(parts[0])
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

  def update_front_matter
    # 先处理根目录下的非主要目录文件
    Dir.glob(File.join(@docs_dir, '*.md')).each do |file|
      basename = File.basename(file, '.md')
      next if basename == 'index'
      next if %w[docker kubernetes middleware os tools network ai books materiel].include?(basename)
      
      # 移动到 materiel 目录
      new_path = File.join(@docs_dir, 'materiel', File.basename(file))
      FileUtils.mv(file, new_path) unless file == new_path
    end

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
end

if __FILE__ == $0
  docs_dir = File.expand_path('../../_docs', __FILE__)
  organizer = DocOrganizer.new(docs_dir)
  organizer.organize
end
