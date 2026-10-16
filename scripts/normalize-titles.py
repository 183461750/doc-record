#!/usr/bin/env python3
"""统一「页面标题」的来源，消除正文 H1 与页面标题的重复渲染。

背景：Starlight 会用 front matter 的 `title`（缺失时回退为正文首个 H1）
渲染页面顶部标题区，正文中的 H1 也会原样渲染。因此：

- 文件无 front matter 且正文以 H1 开头 → 页面出现双标题；
- 文件有 front matter 且正文首个 H1 与 `title` 相同 → 同样双标题。

处理规则：

1. 无 front matter、正文首个内容行是 H1 → 以该 H1 为 `title` 生成
   front matter，并删除正文中的该 H1；
2. 有 front matter、正文首个内容行是 H1 且与 `title` 一致 → 删除该 H1；
3. 有 front matter、H1 与 `title` 不一致 → 不修改，输出提示由人工复核；
4. `SKILL.md` 遵循 Agent Skills 规范，不参与本迁移。

删除 H1 时同步清理其正上方与正下方的空行，避免正文顶部残留连续空行。

用法：

    python3 scripts/normalize-titles.py            # 先预览（dry run）
    python3 scripts/normalize-titles.py --write    # 实际写入
"""

from __future__ import annotations

# 豁免清单与内容门禁共用一份，见 scripts/content_rules.py
from content_rules import SKIP_FILES

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'src/content/docs'

H1_PATTERN = re.compile(r'^#\s+(.+?)\s*#*\s*$')
FRONTMATTER_PATTERN = re.compile(r'\A---\r?\n.*?\r?\n---(?:\r?\n|$)', re.S)
TITLE_PATTERN = re.compile(r'^title:\s*(.+?)\s*$', re.M)


def unquote(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
        return value[1:-1]
    return value


def yaml_quote(value: str) -> str:
    """title 值统一用双引号包裹，转义反斜杠与双引号，避免冒号等触发 YAML 歧义。"""
    return '"' + value.replace('\\', '\\\\').replace('"', '\\"') + '"'


def strip_leading_blank_lines(lines: list[str]) -> list[str]:
    index = 0
    while index < len(lines) and not lines[index].strip():
        index += 1
    return lines[index:]


def process(path: Path, write: bool) -> str:
    text = path.read_text(encoding='utf-8')

    match = FRONTMATTER_PATTERN.match(text)
    body = text[match.end():] if match else text
    title_match = TITLE_PATTERN.search(match.group(0)) if match else None
    title = unquote(title_match.group(1)) if title_match else None

    content_lines = strip_leading_blank_lines(body.splitlines())
    if not content_lines:
        return 'skip: 空正文'
    h1_match = H1_PATTERN.match(content_lines[0])
    if not h1_match:
        return 'skip: 正文首个内容行不是 H1'
    if path.name in SKIP_FILES:
        return 'skip: 豁免文件'
    h1 = h1_match.group(1).strip()

    if title is not None and title != h1:
        return f'manual: H1「{h1}」与 title「{title}」不一致，请人工复核'

    # 删除 H1 行及其正下方一个空行；H1 上方原本的前导空行一并清理。
    rest = strip_leading_blank_lines(content_lines[1:])

    if title is None:
        frontmatter = f'---\ntitle: {yaml_quote(h1)}\n---\n\n'
        new_text = frontmatter + '\n'.join(rest) + '\n'
        action = 'create-fm'
    else:
        new_text = text[: match.end()] + '\n'.join(rest) + '\n'
        action = 'drop-h1'

    if write:
        path.write_text(new_text, encoding='utf-8')
    return f'{action}: {h1}'


def main() -> int:
    parser = argparse.ArgumentParser(description='消除正文 H1 与页面标题的重复渲染')
    parser.add_argument('--write', action='store_true', help='实际写入，缺省仅预览')
    args = parser.parse_args()

    counters = {'create-fm': 0, 'drop-h1': 0, 'manual': 0, 'skip': 0}
    for path in sorted(list(ROOT.rglob('*.md')) + list(ROOT.rglob('*.mdx'))):
        result = process(path, args.write)
        key = result.split(':', 1)[0]
        counters[key if key in counters else 'skip'] += 1
        print(f'{path.relative_to(ROOT)}: {result}')

    print(
        f"\n汇总：补 front matter {counters['create-fm']}，"
        f"删重复 H1 {counters['drop-h1']}，"
        f"待人工复核 {counters['manual']}，"
        f"跳过 {counters['skip']}（{'已写入' if args.write else '预览，未写入'}）"
    )
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
