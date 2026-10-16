/**
 * 给正文图片统一加上 `loading="lazy"` 与 `decoding="async"`。
 *
 * 迁移遗留：正文图片有一部分仍指向旧仓库的远程地址（GitHub blob 的 `?raw=true`
 * 形式），共 23 处、分布在 14 个页面。浏览器把未声明 `loading` 的图片按 `eager`
 * 处理，且 `eager` 图片会计入 `load` 事件 —— 远程图片一旦慢或不可达，页面的
 * `load` 就长时间挂起。
 *
 * 这个坑在博客列表页由作者头像（`https://github.com/iuin8.png`，同样是 eager）
 * 触发过一次：本地 e2e 的 `page.goto` 等 `load`，在 Clash 代理下偶发卡满 30 秒
 * 超时（见 adr/2026-10-14-代码审查发现项附录的 N5/N6）。图片地址本身属于内容侧
 * 的后续迁移工作，这里先保证「第三方资源不再拖住页面加载」这一条不再复发。
 *
 * 视口内的图片照常立即加载，因此不影响首屏；文档里显式写过的属性不覆盖。
 */

import type { Image, Root, RootContent } from 'mdast';

const LAZY_PROPS = { loading: 'lazy', decoding: 'async' } as const;

function applyToImages(node: RootContent) {
  if (node.type === 'image') {
    const image = node as Image;
    image.data ??= {};
    // mdast 的 ImageData 没有声明 hProperties（该约定由 mdast-util-to-hast 在转换时读取），
    // 这里显式收窄后写入，保留文档里显式声明的同名属性，且不引入 any。
    const data = image.data as Image['data'] & { hProperties?: Record<string, string> };
    data.hProperties = { ...LAZY_PROPS, ...data.hProperties };
    return;
  }

  if ('children' in node) {
    for (const child of node.children) applyToImages(child as RootContent);
  }
}

export function remarkLazyImages() {
  return (tree: Root) => {
    for (const child of tree.children) applyToImages(child);
  };
}
