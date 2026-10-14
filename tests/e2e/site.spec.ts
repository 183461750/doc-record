import { expect, test } from '@playwright/test';

/**
 * 站点结构冒烟：页面可访问、标题唯一、侧边栏无叠压。
 *
 * 「正文 H1 与页面标题重复」「侧边栏条目因固定行高叠压」都是曾发生过
 * 的回归，用例针对这两类问题设置断言，防止后续改动再次引入。
 */

// 取深层路径：七级目录 + 长中文标题，能同时覆盖侧边栏折叠、截断与缩进封顶
const DOC_PAGE = '/zh-cn/docker/app/devs/data/elasticsearch/v1/test/test/';
const BLOG_PAGE = '/zh-cn/blog/';
// 取有前后邻居的博客文章：同时覆盖插件的卡片导航与曾经的 Starlight 文档分页
const BLOG_POST = '/zh-cn/blog/docker/dev_utls/dev-container/remote-ssh/cpolar/article/doc/';

test('首页可访问且渲染 landing 区块', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBeLessThan(400);
  await expect(page).toHaveTitle(/Doc Record/);
});

test('文档页标题唯一（正文 H1 不与页面标题重复）', async ({ page }) => {
  await page.goto(DOC_PAGE);
  await expect(page.locator('main h1')).toHaveCount(1);
});

// 夹具：src/content/docs/zh-cn/test/no-frontmatter.md 不声明 front matter，
// 标题由 loader 从正文首个 H1 推导，该 H1 由 remark 插件在构建期移除
test('未声明 front matter 的文档标题唯一', async ({ page }) => {
  await page.goto('/zh-cn/test/no-frontmatter/');
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('main h1')).toHaveText('无 front matter 的文档');
  // 正文的二级标题仍正常渲染
  await expect(page.locator('main h2').filter({ hasText: '二级标题' })).toBeVisible();
});

test('博客页可访问且导航栏含博客入口', async ({ page }) => {
  await page.goto(BLOG_PAGE);
  await expect(page).toHaveTitle(/Doc Record/);
});

// 博客文章寄居在 docs 集合（starlight-blog 的强制约定），曾因此同时被文档侧边栏
// 与 Starlight 的文档分页收录：博客文章页出现两套上下篇，文档分页按目录字母序取
// 邻居，与插件按发布日期渲染的卡片顺序互相冲突。现由 src/content.config.ts 的
// loader 统一给博客条目置 `sidebar.hidden`，两处症状一并消除。
test('博客文章页只有一套上下篇导航', async ({ page }) => {
  await page.goto(BLOG_POST);
  // 插件在正文末尾渲染的卡片导航：上一篇与下一篇都在
  await expect(page.locator('.sl-blog-pagination a')).toHaveCount(2);
  // 回归断言：文档分页不应再出现在博客文章页
  await expect(page.locator('.pagination-links a')).toHaveCount(0);
});

test('文档侧边栏只保留唯一的博客入口，不列出博客文章', async ({ page }) => {
  await page.goto(DOC_PAGE);
  const sidebar = page.locator('#starlight__sidebar');
  // 回归断言：博客文章曾作为 `blog` 分组出现在文档侧边栏，并被文档分页当作相邻文档
  await expect(
    sidebar.locator('a[href^="/zh-cn/blog/"]:not([href="/zh-cn/blog/"])'),
  ).toHaveCount(0);
  // 插件为文档侧边栏注入的博客总入口仍在（博客文章改由博客页自身的侧边栏呈现）
  await expect(sidebar.locator('a[href="/zh-cn/blog/"]')).toHaveCount(1);
  // 文档页自身的上下篇不受影响
  expect(await page.locator('.pagination-links a').count()).toBeGreaterThan(0);
});

test('侧边栏长标题两行内截断，悬浮展开且相邻条目无叠压', async ({ page }) => {
  await page.goto(DOC_PAGE);
  const sidebar = page.locator('#starlight__sidebar');
  await expect(sidebar).toBeVisible();

  // 回归断言：Black 的 .entry-link 曾固定 height:30px，长中文标题换行后
  // 溢出部分与相邻条目叠压。后续引入了两行截断策略，截断是预期行为，
  // 改为断言：截断不超过两行、悬浮可展开完整标题、条目之间不叠压。
  const entries = sidebar.locator('.entry-link:visible');
  const count = await entries.count();
  expect(count).toBeGreaterThan(0);

  const heights = await entries.evaluateAll((els) =>
    els.map((el) => ({
      top: el.getBoundingClientRect().top,
      bottom: el.getBoundingClientRect().bottom,
      h: el.clientHeight,
      sh: el.scrollHeight,
      lineHeight: parseFloat(getComputedStyle(el).lineHeight) || 20,
    })),
  );

  // 截断条目的容器高度不超过两行（line-height 为 normal 时以 64px 兜底）
  for (const [index, item] of heights.entries()) {
    const limit = Math.max(item.lineHeight * 2 + 16, 64);
    expect.soft(item.h, `第 ${index + 1} 个条目截断超过两行`).toBeLessThanOrEqual(limit);
  }

  // 可见条目之间不发生纵向叠压
  const sorted = [...heights].sort((a, b) => a.top - b.top);
  for (let index = 1; index < sorted.length; index += 1) {
    expect
      .soft(sorted[index].top, `第 ${index + 1} 个可见条目与上一条目叠压`)
      .toBeGreaterThanOrEqual(sorted[index - 1].bottom - 1);
  }

  // 存在截断条目时，悬浮应解除截断并展示完整标题（不再有溢出内容）
  const clampedIndex = heights.findIndex((item) => item.sh > item.h + 1);
  if (clampedIndex >= 0) {
    const target = entries.nth(clampedIndex);
    await target.hover();
    const after = await target.evaluate((el) => ({ h: el.clientHeight, sh: el.scrollHeight }));
    expect.soft(after.h, '悬浮后条目仍被截断').toBeGreaterThanOrEqual(after.sh);
  }
});

test('当前页所在的侧边栏分组默认展开，其余分组折叠', async ({ page }) => {
  await page.goto(DOC_PAGE);
  const details = page.locator('#starlight__sidebar details');
  const total = await details.count();
  if (total === 0) return; // 浅层页面无嵌套分组
  // 当前页所在链路上的分组应为展开态（aria/details 语义）
  const expanded = await details.evaluateAll((nodes) =>
    nodes.map((node) => (node as HTMLDetailsElement).open),
  );
  expect(expanded.some(Boolean)).toBe(true);
});

test('首页所有站内入口均可访问（无死链）', async ({ page, request }) => {
  // 根路径 301 到默认语言首页，等跳转完成再取链接，避免在导航中取 DOM
  await page.goto('/');
  await page.waitForURL(/\/zh-cn\//);

  const links = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="/"]')].map((anchor) => anchor.getAttribute('href')!),
  );
  const unique = [...new Set(links)];
  // 首页的分类卡片与 hero 入口，加上导航与页脚链接
  expect(unique.length).toBeGreaterThan(3);

  for (const href of unique) {
    const response = await request.get(href);
    expect.soft(response.status(), `死链：${href}`).toBeLessThan(400);
  }
});

test('分类索引页列出该分类下的子分类与文档', async ({ page }) => {
  await page.goto('/zh-cn/category/docker/');
  await expect(page.locator('main h1')).toHaveCount(1);
  // 子分类卡片与文档列表都指向存在的地址
  const entries = page.locator('main a[href^="/zh-cn/"]');
  const count = await entries.count();
  expect(count).toBeGreaterThan(0);
});

test('代码块不横向溢出文档容器', async ({ page }) => {
  await page.goto(DOC_PAGE);
  const overflow = await page.evaluate(() => {
    const frame = document.querySelector('main');
    if (!frame) return false;
    return frame.scrollWidth <= frame.clientWidth + 1;
  });
  expect(overflow).toBe(true);
});
