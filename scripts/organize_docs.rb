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
      'AI' => {title: 'AI', order: 8},
      'books' => {title: '资料', order: 9}
    }

    main_dirs.each do |dir, info|
      path = File.join(@docs_dir, dir)
      FileUtils.mkdir_p(path) unless dir.empty?
      
      create_index_md(path, info[:title], info[:order])
    end
  end

  def create_index_md(path, title, order)
    index_path = File.join(path, 'index.md')
    return if File.exist?(index_path)

    content = <<~YAML
    ---
    layout: "default"
    title: "#{title}"
    nav_order: #{order}
    has_children: true
    permalink: "/#{path.sub(@docs_dir, '').sub(/^\//, '')}/"
    ---

    # #{title}

    这里包含了#{title}相关的所有文档。
    YAML

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
      if content =~ /^---\s*\n(.*?)^---\s*$/m
        front_matter = YAML.load($1) rescue {}
        
        # 更新front matter
        front_matter['layout'] = 'default'
        front_matter['has_children'] = false if front_matter['has_children'].nil?
        
        # 生成相对路径作为permalink
        rel_path = file.sub(@docs_dir, '').sub(/^\//, '').sub(/\.md$/, '')
        front_matter['permalink'] = "/#{rel_path}/"
        
        # 如果没有nav_order，根据目录深度和名称生成
        if front_matter['nav_order'].nil?
          depth = rel_path.count('/')
          @nav_order[depth] ||= 0
          @nav_order[depth] += 1
          front_matter['nav_order'] = @nav_order[depth]
        end
        
        # 更新文件
        new_content = "---\n#{front_matter.to_yaml}---\n\n#{content.sub(/^---.*?---\s*/m, '')}"
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
