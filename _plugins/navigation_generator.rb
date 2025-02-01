module Jekyll
  class NavigationGenerator < Generator
    safe true
    priority :high

    def generate(site)
      @site = site
      @base_dir = File.join(@site.source, '_docs')
      
      # 生成导航树
      nav_tree = generate_nav_tree(@base_dir)
      
      # 将导航树保存到 site.data
      site.data['navigation'] = nav_tree
      
      # 更新所有文档的 URL
      update_document_urls(site.pages)
    end

    private

    def generate_nav_tree(dir, parent_path = '')
      entries = Dir.entries(dir).reject { |e| e.start_with?('.') }
      
      # 按照以下顺序排序：1. index.md 2. 目录 3. 其他文件
      entries.sort_by! do |e|
        path = File.join(dir, e)
        if e == 'index.md'
          '0'
        elsif File.directory?(path)
          "1#{e}"
        else
          "2#{e}"
        end
      end

      items = []
      
      entries.each do |entry|
        path = File.join(dir, entry)
        next if entry == 'index.md'  # 跳过 index.md，它会被单独处理
        
        if File.directory?(path)
          # 处理目录
          index_path = File.join(path, 'index.md')
          title = get_directory_title(index_path) || entry.split('_').map(&:capitalize).join(' ')
          
          children = generate_nav_tree(path, "#{parent_path}#{entry}/")
          next if children.empty?  # 跳过空目录
          
          items << {
            'title' => title,
            'url' => "/#{parent_path}#{entry}/",
            'children' => children
          }
        elsif entry.end_with?('.md')
          # 处理 Markdown 文件
          title = get_file_title(File.join(dir, entry)) || entry.sub('.md', '').split('_').map(&:capitalize).join(' ')
          url = "/#{parent_path}#{entry.sub('.md', '')}/"
          
          items << {
            'title' => title,
            'url' => url
          }
        end
      end

      items
    end

    def get_directory_title(index_path)
      return nil unless File.exist?(index_path)
      get_file_title(index_path)
    end

    def get_file_title(file_path)
      content = File.read(file_path)
      if content =~ /^(---\s*\n.*?\n?)^(---\s*$\n?)/m
        front_matter = YAML.load($1) rescue nil
        return front_matter['title'] if front_matter && front_matter['title']
      end
      nil
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
