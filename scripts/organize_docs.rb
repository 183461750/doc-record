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
      'books' => {title: '资料', order: 9}
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
    title: "#{title}"
    nav_order: #{order}
    has_children: true
    permalink: "#{permalink}"
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
        
        # 确保 title 有引号
        if front_matter['title']
          front_matter['title'] = %Q("#{front_matter['title']}") unless front_matter['title'].start_with?('"') || front_matter['title'].start_with?("'")
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
