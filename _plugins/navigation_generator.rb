require 'yaml'
require 'json'

module Jekyll
  class NavigationGenerator < Generator
    safe true
    priority :high

    def generate(site)
      @site = site
      @base_dir = File.join(@site.source, '_docs')
      @nav_config = site.data['nav_config'] || {}
      
      # 生成导航树
      nav_tree = generate_nav_tree(@base_dir)
      
      # 生成面包屑数据
      breadcrumbs = generate_breadcrumbs(nav_tree)
      
      # 收集标签
      tags = collect_tags(nav_tree)
      
      # 生成搜索索引
      search_index = generate_search_index(nav_tree) if @nav_config.dig('search', 'enabled')
      
      # 将数据保存到 site.data
      site.data['navigation'] = nav_tree
      site.data['breadcrumbs'] = breadcrumbs
      site.data['tags'] = tags
      site.data['search_index'] = search_index if search_index
      
      # 更新所有文档的 URL
      update_document_urls(site.pages)
    end

    private

    def generate_breadcrumbs(nav_tree, parent_path = [], result = {})
      nav_tree.each do |item|
        current_path = parent_path + [{ title: item['title'], url: item['url'] }]
        result[item['url']] = current_path if item['url']
        
        if item['children']
          generate_breadcrumbs(item['children'], current_path, result)
        end
      end
      result
    end

    def collect_tags(nav_tree, tags = Hash.new { |h, k| h[k] = [] })
      nav_tree.each do |item|
        if item['url']
          file_path = item['url'].sub(/^\//, '').sub(/\/$/, '.md')
          full_path = File.join(@base_dir, file_path)
          
          if File.exist?(full_path)
            metadata = get_file_metadata(full_path)
            if metadata['tags']
              metadata['tags'].each do |tag|
                tags[tag] << {
                  title: item['title'],
                  url: item['url'],
                  date: metadata['date']
                }
              end
            end
          end
        end
        
        collect_tags(item['children'], tags) if item['children']
      end
      tags
    end

    def generate_nav_tree(dir, parent_path = '', level = 0)
      entries = Dir.entries(dir).reject { |e| e.start_with?('.') }
      entries = sort_entries(entries, dir)

      items = []
      
      entries.each do |entry|
        path = File.join(dir, entry)
        next if entry == 'index.md'
        
        if File.directory?(path)
          index_path = File.join(path, 'index.md')
          metadata = get_file_metadata(index_path)
          title = metadata['title'] || entry.split('_').map(&:capitalize).join(' ')
          
          children = generate_nav_tree(path, "#{parent_path}#{entry}/", level + 1)
          next if children.empty?
          
          items << {
            'title' => title,
            'url' => "/#{parent_path}#{entry}/",
            'children' => children,
            'icon' => get_icon_for_directory(entry),
            'level' => level,
            'expanded' => level < (@nav_config['default_expanded_level'] || 1),
            'description' => metadata['description'],
            'tags' => metadata['tags']
          }
        elsif entry.end_with?('.md')
          metadata = get_file_metadata(File.join(dir, entry))
          url = "/#{parent_path}#{entry.sub('.md', '')}/"
          
          items << {
            'title' => metadata['title'] || entry.sub('.md', '').split('_').map(&:capitalize).join(' '),
            'url' => url,
            'level' => level,
            'date' => metadata['date'],
            'description' => metadata['description'],
            'tags' => metadata['tags'],
            'icon' => metadata['icon']
          }
        end
      end

      items
    end

    def sort_entries(entries, dir)
      order_config = @nav_config.dig('order_by', 'type')
      
      case order_config
      when 'title'
        entries.sort_by { |e| get_sort_title(e, dir).downcase }
      when 'date'
        entries.sort_by { |e| get_file_date(File.join(dir, e)) || Time.now }.reverse
      when 'custom'
        custom_order = @nav_config.dig('order_by', 'custom_order') || []
        # 首先按自定义顺序排序，然后按名称排序未定义顺序的项
        entries.sort_by do |e|
          [
            custom_order.index(e) || custom_order.length,
            e.downcase
          ]
        end
      else
        entries.sort_by(&:downcase)
      end
    end

    def get_sort_title(entry, dir)
      path = File.join(dir, entry)
      if File.directory?(path)
        index_path = File.join(path, 'index.md')
        get_directory_title(index_path) || entry
      else
        metadata = get_file_metadata(path)
        metadata['title'] || entry.sub('.md', '')
      end
    end

    def get_file_metadata(file_path)
      return {} unless File.exist?(file_path)
      content = File.read(file_path)
      if content =~ /^(---\s*\n.*?\n?)^(---\s*$\n?)/m
        YAML.load($1) rescue {}
      else
        {}
      end
    end

    def get_file_date(file_path)
      return nil unless File.exist?(file_path)
      metadata = get_file_metadata(file_path)
      metadata['date']
    end

    def get_icon_for_directory(dir_name)
      @nav_config.dig('icons', dir_name)
    end

    def get_directory_title(index_path)
      return nil unless File.exist?(index_path)
      metadata = get_file_metadata(index_path)
      metadata['title']
    end

    def generate_search_index(nav_tree)
      return unless @nav_config.dig('search', 'enabled')
      
      index = []
      build_search_index(nav_tree, index)
      index
    end

    def build_search_index(items, index)
      items.each do |item|
        if item['url']
          file_path = item['url'].sub(/^\//, '').sub(/\/$/, '.md')
          full_path = File.join(@base_dir, file_path)
          
          if File.exist?(full_path)
            content = File.read(full_path)
            index << {
              'title' => item['title'],
              'url' => item['url'],
              'content' => extract_content(content),
              'description' => item['description']
            }
          end
        end
        
        build_search_index(item['children'], index) if item['children']
      end
    end

    def extract_content(content)
      # 移除 front matter
      content = content.sub(/^(---\s*\n.*?\n?)^(---\s*$\n?)/m, '')
      # 移除 Markdown 语法
      content.gsub(/[#*`~\[\](){}|]/, ' ').gsub(/\s+/, ' ').strip
    end

    def update_document_urls(pages)
      pages.each do |page|
        next unless page.path.start_with?('_docs/')
        
        # 更新页面的 URL
        relative_path = page.path.sub('_docs/', '')
        page.data['permalink'] = "/#{relative_path.sub('.md', '')}/"
      end
    end
  end
end
