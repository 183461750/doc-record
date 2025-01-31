module Jekyll
  module ImageFilter
    def img(input)
      site = @context.registers[:site]
      "#{site.config['baseurl']}/assets/images/#{input}"
    end
  end
end

Liquid::Template.register_filter(Jekyll::ImageFilter)
