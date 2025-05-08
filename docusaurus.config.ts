import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const defaultLocale = 'zh-Hans';

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
    defaultLocale: defaultLocale,
    locales: [defaultLocale, 'en'],
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
          editUrl: ({locale, versionDocsDirPath, docPath}) => {
            // if (locale !== defaultLocale) {
            //   return `https://github.com/183461750/doc-record/${locale}`;
            // }
            return `https://github.com/183461750/doc-record/blob/main/${versionDocsDirPath}/${docPath}`;
          },
          remarkPlugins: [
            // 忽略所有代码块解析
            [
                require('remark-parse'),
                {
                    blocks: false
                }
            ],
          ],
        },
        blog: false, // 禁用博客功能
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
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
    announcementBar: {
      content:
        '⭐️ If you like DocSearch, give it a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/183461750/doc-record">GitHub</a>! ⭐️',
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
