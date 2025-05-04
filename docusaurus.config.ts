import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// const math = require('remark-math');
// const katex = require('rehype-katex');

const config: Config = {
  title: 'Doc Record',
  tagline: '个人文档记录',
  favicon: 'img/favicon.ico',

  url: 'https://183461750.github.io',
  baseUrl: '/doc-record',

  organizationName: 'your-github-username', 
  projectName: 'doc-record',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  plugins: [
    [
      "@easyops-cn/docusaurus-search-local",
      {
        hashed: true,
        language: ['zh'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: false,
        searchResultLimits: 8,
        searchResultContextMaxLength: 50,
        docsRouteBasePath: '/'
      }
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // 将文档设置为首页
          editUrl: 'https://github.com/183461750/doc-record',
          remarkPlugins: [
            // // 解决Markdown文件中{xxx}变量被错误解析的问题
            // [
            //     math,
            //     {
            //         skipExport: true
            //     }
            // ],
            // // 自动转义Markdown中的特殊字符
            // [
            //     require('remark-stringify'),
            //     {
            //         escape: ['\\{', '\\}', '\\$']
            //     }
            // ],
            // 忽略所有代码块解析
            [
                require('remark-parse'),
                {
                    blocks: false
                }
            ],
          ],
        //   rehypePlugins: [
        //     [
        //       katex,
        //       {
        //         strict: false, // 可以根据需要调整选项
        //       },
        //     ],
        //   ],
        },
        blog: false, // 禁用博客功能
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    /* 
    要使用Algolia DocSearch，请按照以下步骤操作：
    1. 注册Algolia账号：https://www.algolia.com/
    2. 创建新应用并获取API密钥
    3. 申请DocSearch爬虫：https://docsearch.algolia.com/apply/
      或者设置自己的爬虫：https://docsearch.algolia.com/docs/run-your-own
    4. 收到确认邮件后，使用下面的配置（替换为您的实际值）
    */
    
    // 启用Algolia搜索（取消注释并填入您的实际信息）
    // algolia: {
    //   appId: '6DU1M1NH74',           // 您的Algolia应用ID
    //   apiKey: '56a89ad14a148334e4d1b317a8b10026',   // 您的搜索API密钥（非管理API密钥）
    //   indexName: 'doc-record',    // 您的索引名称
    //   contextualSearch: true,          // 启用上下文搜索
    //   // 可选配置
    //   searchParameters: {},            // 附加搜索参数
    //   searchPagePath: 'search',        // 搜索页面路径
    // },
    navbar: {
      title: 'Doc Record',
      logo: {
        alt: 'Doc Record Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docSidebar',
          position: 'left',
          label: '文档',
        },
        {
          href: 'https://github.com/183461750/doc-record',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {
              label: '首页',
              to: '/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Doc Record. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
