#!/usr/bin/env ruby
require 'yaml'
require 'find'
require 'date'

class DocNode
  attr_accessor :path, :title, :parent, :children, :front_matter, :level

  def initialize(path)
    @path = path
    @children = []
    @front_matter = {}
    parse_front_matter
  end

  def parse_front_matter
    content = File.read(@path)
    if content =~ /\A---\s*\n(.*?)\n---\s*\n/m
      begin
        yaml_content = $1
        @front_matter = YAML.safe_load(yaml_content, permitted_classes: [Time, Date])
        @title = @front_matter['title']
        @parent = @front_matter['parent']
      rescue => e
        puts "Error parsing front matter in file: #{@path}"
        puts "YAML content:\n#{yaml_content}"
        puts "Error: #{e.message}"
        @front_matter = {}
      end
    end
  end

  def generate_permalink
    # 移除 _docs 前缀和 .md 后缀
    rel_path = @path.sub(/^.*\/_docs\//, '').sub(/\.md$/, '')
    # 移除日期前缀
    rel_path = rel_path.sub(/^\d{4}-\d{2}-\d{2}-/, '')
    # 处理中文路径
    rel_path = rel_path.encode('UTF-8')
    # 确保以斜杠开头和结尾，移除多余的斜杠
    "/#{rel_path}/".gsub(/\/+/, '/')
  end

  def calculate_nav_order
    # 基于文件名或目录结构计算导航顺序
    base_name = File.basename(@path)
    if base_name == 'index.md'
      return 1
    elsif base_name =~ /^\d{4}-\d{2}-\d{2}-/
      # 如果有日期前缀，使用日期作为排序依据
      date_str = base_name.match(/^(\d{4}-\d{2}-\d{2})-/)[1]
      return Date.parse(date_str).to_time.to_i
    else
      # 默认使用文件名的字母顺序
      return base_name.downcase.hash.abs % 1000 + 100
    end
  end

  def format_front_matter(front_matter)
    lines = []
    # 确保某些字段按特定顺序出现
    ordered_keys = ['layout', 'title', 'nav_order', 'description', 'parent', 'has_children', 'permalink', 'grand_parent']
    
    # 首先处理有序的键
    ordered_keys.each do |key|
      if front_matter.key?(key)
        value = front_matter[key]
        # 对特定字段进行特殊处理
        formatted_value = case key
        when 'layout', 'title', 'description', 'parent', 'permalink', 'grand_parent'
          value.is_a?(String) ? %Q("#{value}") : value
        when 'nav_order'
          value.is_a?(String) ? value.to_i : value
        else
          value
        end
        lines << "#{key}: #{formatted_value}"
      end
    end
    
    # 处理其他键
    front_matter.each do |key, value|
      next if ordered_keys.include?(key)
      formatted_value = value.is_a?(String) ? %Q("#{value}") : value
      lines << "#{key}: #{formatted_value}"
    end
    
    lines.join("\n")
  end

  def update_front_matter
    content = File.read(@path)
    new_front_matter = @front_matter.clone
    
    begin
      # 更新必要的字段
      new_front_matter['layout'] ||= 'default'
      new_front_matter['title'] ||= File.basename(@path, '.*').gsub(/^\d{4}-\d{2}-\d{2}-/, '')
      new_front_matter['has_children'] = !@children.empty?
      new_front_matter['permalink'] ||= generate_permalink
      new_front_matter['nav_order'] ||= calculate_nav_order
      
      # 确保 description 字段存在
      if !new_front_matter['description']
        # 尝试从文件内容中提取第一段作为描述
        content_without_front_matter = content.sub(/\A---\s*\n.*?\n---\s*\n/m, '')
        first_paragraph = content_without_front_matter.split("\n\n").first&.gsub(/[#\n]/, '')&.strip
        new_front_matter['description'] = first_paragraph if first_paragraph && !first_paragraph.empty?
      end

      # 格式化 front matter
      formatted_front_matter = format_front_matter(new_front_matter)
      new_content = content.sub(/\A---\s*\n.*?\n---\s*\n/m, "---\n#{formatted_front_matter}\n---\n\n")
      
      # 在写入之前进行验证
      begin
        YAML.safe_load("---\n#{formatted_front_matter}\n---\n", permitted_classes: [Time, Date])
        File.write(@path, new_content)
        puts "✅ Successfully updated front matter in: #{@path}"
      rescue => e
        puts "❌ YAML validation failed for: #{@path}"
        puts "Error: #{e.message}"
        puts "Generated front matter:\n#{formatted_front_matter}"
      end
    rescue => e
      puts "❌ Error updating front matter in file: #{@path}"
      puts "Error: #{e.message}"
      puts "Stack trace:\n#{e.backtrace.join("\n")}"
    end
  end
end

class DocTree
  attr_reader :root_nodes

  def initialize(docs_dir)
    @docs_dir = docs_dir
    @nodes = {}
    @root_nodes = []
    build_tree
  end

  def build_tree
    # 首先创建所有节点
    Find.find(@docs_dir) do |path|
      next unless path.end_with?('.md')
      begin
        node = DocNode.new(path)
        @nodes[path] = node
        puts "Processed file: #{path}"
      rescue => e
        puts "Error processing file: #{path}"
        puts "Error: #{e.message}"
      end
    end

    # 建立父子关系
    @nodes.each_value do |node|
      if node.parent
        parent_node = find_parent(node)
        if parent_node
          parent_node.children << node
          puts "Added child #{node.path} to parent #{parent_node.path}"
        else
          @root_nodes << node
          puts "No parent found for #{node.path}, added to root"
        end
      else
        @root_nodes << node
        puts "No parent specified for #{node.path}, added to root"
      end
    end
  end

  def find_parent(node)
    @nodes.values.find { |n| n.title == node.parent }
  end

  def update_all_front_matter
    @nodes.each_value(&:update_front_matter)
  end
end

# 主程序
docs_dir = ARGV[0] || '/Users/fa/dev/projects/other/me/doc-main/doc-record/_docs'
puts "Starting front matter update for directory: #{docs_dir}"
tree = DocTree.new(docs_dir)
tree.update_all_front_matter

puts "Front matter 更新完成！"
