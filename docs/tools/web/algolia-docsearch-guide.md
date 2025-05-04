---
title: Algolia DocSearch 配置指南
description: 如何为Docusaurus网站配置Algolia搜索功能
---

# Algolia DocSearch 配置指南

## 简介

Algolia DocSearch 是一个强大的文档搜索服务，可以为技术文档网站提供高质量的搜索体验。本指南将帮助你为 Docusaurus 网站配置 Algolia 搜索功能。

## 步骤 1: 注册 Algolia 账号

1. 访问 [Algolia 官网](https://www.algolia.com/) 并注册一个账号
2. 登录后，创建一个新的应用程序（Application）
3. 记下你的应用程序 ID（Application ID）

## 步骤 2: 申请 DocSearch 爬虫或设置自己的爬虫

### 选项 A: 申请官方 DocSearch 爬虫（推荐）

1. 访问 [DocSearch 申请页面](https://docsearch.algolia.com/apply/)
2. 填写表单，提供你的网站 URL 和其他必要信息
3. 提交申请后，Algolia 团队会审核你的申请
4. 如果申请被接受，你将收到一封包含配置信息的电子邮件

### 选项 B: 设置自己的爬虫

如果你想自己管理爬虫，可以按照以下步骤操作：

1. 安装 DocSearch 爬虫：
   ```bash
   npm install @docsearch/scraper
   ```

2. 创建配置文件 `docsearch.config.json`：
   ```json
   {
     "index_name": "你的索引名称",
     "start_urls": ["https://你的网站域名/"],
     "sitemap_urls": ["https://你的网站域名/sitemap.xml"],
     "sitemap_alternate_links": true,
     "stop_urls": [],
     "selectors": {
       "lvl0": {
         "selector": ".menu__link--sublist.menu__link--active",
         "global": true,
         "default_value": "Documentation"
       },
       "lvl1": "article h1",
       "lvl2": "article h2",
       "lvl3": "article h3",
       "lvl4": "article h4",
       "lvl5": "article h5, article td:first-child",
       "text": "article p, article li, article td:last-child"
     },
     "strip_chars": " .,;:#",
     "custom_settings": {
       "separatorsToIndex": "_",
       "attributesForFaceting": ["language", "version", "type", "docusaurus_tag"],
       "attributesToRetrieve": ["hierarchy", "content", "anchor", "url", "url_without_anchor", "type"]
     }
   }
   ```

3. 在 Algolia 控制面板中创建 API 密钥：
   - 导航到 API Keys 页面
   - 创建一个新的 API 密钥，具有以下权限：
     - search
     - addObject
     - deleteObject
     - deleteIndex
     - settings
     - editSettings

4. 运行爬虫：
   ```bash
   docker run -it --env-file=.env -e "CONFIG=$(cat docsearch.config.json | jq -r tostring)" algolia/docsearch-scraper
   ```

   其中 `.env` 文件包含：
   ```
   APPLICATION_ID=你的应用ID
   API_KEY=你的管理API密钥
   ```

## 步骤 3: 配置 Docusaurus

1. 安装 Algolia 搜索主题：
   ```bash
   npm install --save @docusaurus/theme-search-algolia
   ```

2. 在 `docusaurus.config.ts` 中配置 Algolia：
   ```typescript
   // docusaurus.config.ts
   export default {
     // ...
     themeConfig: {
       // ...
       algolia: {
         appId: '你的应用ID',           // 你的 Algolia 应用 ID
         apiKey: '你的搜索API密钥',      // 你的搜索 API 密钥（非管理 API 密钥）
         indexName: '你的索引名称',      // 你的索引名称
         contextualSearch: true,        // 启用上下文搜索
         // 可选配置
         searchParameters: {},          // 附加搜索参数
         searchPagePath: 'search',      // 搜索页面路径
       },
       // 注意：启用 Algolia 后，应注释或删除本地搜索配置
       // search: {
       //   provider: require.resolve('@easyops-cn/docusaurus-search-local'),
       //   // ...
       // },
     },
   };
   ```

3. 重启开发服务器：
   ```bash
   npm run start
   ```

## 步骤 4: 验证搜索功能

1. 访问你的网站
2. 点击导航栏中的搜索图标
3. 输入一些关键词进行搜索
4. 验证搜索结果是否正确显示

## 常见问题

### 搜索结果为空

- 确保爬虫已成功运行并索引了你的网站
- 检查 Algolia 控制面板中的索引是否包含数据
- 验证 `apiKey` 是否为搜索 API 密钥（非管理 API 密钥）

### 依赖冲突

如果安装 `@docusaurus/theme-search-algolia` 时出现依赖冲突，可以尝试：

```bash
# 使用 --legacy-peer-deps 选项
npm install --save @docusaurus/theme-search-algolia --legacy-peer-deps

# 或使用 --force 选项
npm install --save @docusaurus/theme-search-algolia --force
```

### 本地搜索与 Algolia 搜索共存

不建议同时启用两种搜索方式，应该选择其中一种：

- 如果你希望使用 Algolia，请注释或删除本地搜索配置
- 如果你希望使用本地搜索，请注释或删除 Algolia 配置

## 资源链接

- [Algolia DocSearch 官方文档](https://docsearch.algolia.com/docs/what-is-docsearch)
- [Docusaurus Algolia 搜索文档](https://docusaurus.io/docs/search#using-algolia-docsearch)
- [Algolia 控制面板](https://www.algolia.com/dashboard)