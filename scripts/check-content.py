#!/usr/bin/env python3
"""内容质量门禁。

在合并前发现文档中的结构性问题，避免因单点疏漏导致整站构建降级或外泄敏感信息。

检查项：

1. 代码块围栏语言是否在 Shiki 支持范围内（不在范围内会静默回退为纯文本）
2. front matter 是否只使用跨框架通用字段
3. 相对链接与图片引用指向的文件是否存在（站内绝对路径按 `public/` 解析）
4. 是否包含疑似密钥（阻断）；内网地址仅汇总提示，不阻断

另有两项提示：正文以一级标题开头、以及内网地址，均只提示不阻断。

用法：

    python3 scripts/check-content.py                 # 全量检查
    python3 scripts/check-content.py <文件>...       # 仅检查指定文件

退出码：发现错误时为 1，仅有提示时为 0。
"""

from __future__ import annotations

# 豁免清单与标题规则由内容脚本共用，见 scripts/content_rules.py
from content_rules import SKIP_FILES as SKIP_FRONTMATTER_CHECK

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path

# 与《2026-09-11-Astro-Starlight-迁移实施记录》第九节一致的通用字段集合
ALLOWED_FRONTMATTER_FIELDS = {'title', 'description', 'date', 'tags', 'authors'}

# 框架特有字段，命中时给出更具体的说明
FRAMEWORK_SPECIFIC_FIELDS = {
    'sidebar_position': 'Docusaurus / VitePress',
    'sidebar_label': 'Docusaurus',
    'custom_edit_url': 'Docusaurus',
    'slug': 'Docusaurus / Astro',
    'id': 'Docusaurus',
    'template': 'Starlight',
    'hero': 'Starlight',
    'prev': 'Starlight',
    'next': 'Starlight',
}

# Shiki 语言表中无对应条目、但 Expressive Code 可识别的通用别名
LANGUAGE_ALIASES = {'text', 'txt', 'plain', 'plaintext', 'ansi'}

SECRET_PATTERNS: tuple[tuple[str, str], ...] = (
    (r'\bAKIA[0-9A-Z]{16}\b', 'AWS 访问密钥'),
    (r'\bghp_[A-Za-z0-9]{36}\b', 'GitHub 个人访问令牌'),
    (r'\bgithub_pat_[A-Za-z0-9_]{20,}', 'GitHub 细粒度令牌'),
    (r'\bsk-[A-Za-z0-9]{24,}\b', 'OpenAI 风格密钥'),
    (r'\bxox[baprs]-[A-Za-z0-9-]{10,}', 'Slack 令牌'),
)

PEM_HEADER_PATTERN = re.compile(r'-----BEGIN [A-Z ]*PRIVATE KEY-----')
PEM_BODY_PATTERN = re.compile(r'^[A-Za-z0-9+/]{32,}={0,2}$')
# 示例文档中常见的占位标记，命中即视为示例而非真实密钥
PLACEHOLDER_MARKERS = ('xxx', 'XXX', '...', '示例', 'placeholder', 'REDACTED', 'YOUR_', '<')

PRIVATE_ADDRESS_PATTERN = re.compile(
    r'\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}'
    r'|192\.168\.\d{1,3}\.\d{1,3}'
    r'|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b'
)

FENCE_PATTERN = re.compile(r'^\s*(`{3,}|~{3,})(.*)$')
FRONTMATTER_FIELD_PATTERN = re.compile(r'^([A-Za-z_][\w-]*):')
# 正文一级标题：页面标题区已渲染同一文案，正文再写会被构建期移除
BODY_H1_PATTERN = re.compile(r'^ {0,3}#\s+\S')
LINK_PATTERN = re.compile(r'!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)')
# host:port 形态的目标不是文件引用，例如 localhost:8080
HOST_PORT_PATTERN = re.compile(r'^[A-Za-z0-9][\w.-]*:\d+(?:/|$)')


@dataclass
class Finding:
    path: Path
    line: int
    level: str
    message: str

    def __str__(self) -> str:
        return f'{self.path}:{self.line}: [{self.level}] {self.message}'


def load_shiki_languages(repo_root: Path) -> set[str] | None:
    """读取 Shiki 语言包目录，得到受支持的语言名集合。依赖缺失时返回 None。

    包管理器不同，该目录的实际位置也不同：bun / npm 使用扁平布局，
    pnpm 将传递依赖放在 `.pnpm` 下，因此逐个尝试候选路径。
    """
    candidates = (
        'node_modules/@shikijs/langs/dist',
        'node_modules/shiki/dist/langs',
    )
    for candidate in candidates:
        langs_dir = repo_root / candidate
        if langs_dir.is_dir():
            return {path.stem for path in langs_dir.glob('*.mjs')}

    for langs_dir in sorted(repo_root.glob('node_modules/.pnpm/@shikijs+langs*/node_modules/@shikijs/langs/dist')):
        return {path.stem for path in langs_dir.glob('*.mjs')}

    return None


def iter_markdown_files(root: Path):
    for path in sorted(root.rglob('*.md')):
        yield path
    for path in sorted(root.rglob('*.mdx')):
        yield path


def split_frontmatter(lines: list[str]) -> list[tuple[int, str]]:
    """返回 front matter 中的 (行号, 字段名) 列表。文件无 front matter 时返回空列表。"""
    if not lines or lines[0].strip() != '---':
        return []
    fields: list[tuple[int, str]] = []
    for index in range(1, len(lines)):
        if lines[index].strip() in ('---', '...'):
            break
        match = FRONTMATTER_FIELD_PATTERN.match(lines[index])
        if match:
            fields.append((index + 1, match.group(1)))
    return fields


def find_code_fence_languages(
    lines: list[str], languages: set[str] | None
) -> list[tuple[int, str]]:
    """找出围栏语言不在支持范围内的代码块。依赖缺失时跳过该项检查。"""
    problems: list[tuple[int, str]] = []
    if languages is None:
        return problems

    open_fence: str | None = None
    for index, line in enumerate(lines, start=1):
        match = FENCE_PATTERN.match(line)
        if not match:
            continue
        fence, info = match.group(1), match.group(2)
        if open_fence is None:
            open_fence = fence
            language = info.strip().split()[0] if info.strip() else ''
            # 未标注语言的代码块按纯文本渲染，不视为问题
            if not language:
                continue
            lowered = language.lower()
            if lowered not in languages and lowered not in LANGUAGE_ALIASES:
                problems.append((index, language))
        elif fence[0] == open_fence[0] and len(fence) >= len(open_fence):
            open_fence = None
    return problems


def find_broken_local_links(
    path: Path, lines: list[str], repo_root: Path
) -> list[tuple[int, str]]:
    problems: list[tuple[int, str]] = []
    for index, line in enumerate(lines, start=1):
        for target in LINK_PATTERN.findall(line):
            if target.startswith(('http://', 'https://', 'mailto:', 'tel:', '#', 'data:')):
                continue
            cleaned = target.split('#')[0].split('?')[0]
            if not cleaned or HOST_PORT_PATTERN.match(cleaned):
                continue
            # 站内绝对路径按 public/ 解析，相对路径按当前文件所在目录解析
            base = repo_root / 'public' if cleaned.startswith('/') else path.parent
            if not (base / cleaned.lstrip('/')).exists():
                problems.append((index, target))
    return problems


def frontmatter_title(lines: list[str]) -> str | None:
    """front matter 中声明的 title，未声明时返回 None。"""
    if not lines or lines[0].strip() != '---':
        return None
    for index in range(1, len(lines)):
        if lines[index].strip() in ('---', '...'):
            break
        match = re.match(r'^title:\s*(.+?)\s*$', lines[index])
        if match:
            return match.group(1).strip().strip('"\'')
    return None


def body_start_line(lines: list[str]) -> int:
    """正文起始行号：无 front matter 时为 0，否则为其结束行的下一行。"""
    if not lines or lines[0].strip() != '---':
        return 0
    for index in range(1, len(lines)):
        if lines[index].strip() in ('---', '...'):
            return index + 1
    return 0


def find_body_h1(lines: list[str]) -> list[tuple[int, str, str]]:
    """提示正文以一级标题开头的文档。

    页面标题区已渲染同一文案：一级标题与页面标题一致时构建期移除该标题
    （见 src/plugins/remark-strip-duplicate-h1.ts）；不一致时会与标题区
    并列显示，通常应降级为二级标题。二者都不影响构建，故仅提示。
    """
    title = frontmatter_title(lines)
    for index in range(body_start_line(lines), len(lines)):
        raw = lines[index]
        if not raw.strip():
            continue
        match = BODY_H1_PATTERN.match(raw)
        if match:
            heading_text = match.group(0).lstrip('#').strip()
            # 未声明 title 时页面标题正是由该标题推导而来，同样会被移除
            kind = 'chapter' if title is not None and title != heading_text else 'repeated'
            return [(index + 1, raw.strip(), kind)]
        break
    return []


def iter_outside_fences(lines: list[str], start: int = 0):
    """逐行产出围栏代码块之外的 (行号, 行内容)，行号从 start 起算。

    围栏状态必须从文档开头开始跟踪：从中间起扫会把「已经打开的围栏」当成正文，
    于是围栏里的 `#` 注释（shell / SQL）会被误判成一级标题。
    """
    open_fence: str | None = None
    for index, line in enumerate(lines):
        match = FENCE_PATTERN.match(line)
        if match:
            fence = match.group(1)
            if open_fence is None:
                open_fence = fence
            elif fence[0] == open_fence[0] and len(fence) >= len(open_fence) and not match.group(2).strip():
                open_fence = None
            continue
        if open_fence is None and index >= start:
            # 缩进代码块（4 空格或制表符）里的 `#` 是注释，不是标题
            if line.startswith('    ') or line.startswith('\t'):
                continue
            yield index + 1, line


def find_extra_body_h1(lines: list[str]) -> list[tuple[int, str]]:
    """找出首个内容块之后的正文一级标题。

    页面标题区已渲染 h1，正文里的章节标题应当用二级：多出来的 h1 会让页面出现多个
    一级标题（审查项 N2：曾有 5 个页面各自 2–5 个 h1），影响大纲与无障碍阅读顺序。
    围栏代码块内的 `#` 注释（shell/SQL）不算标题。
    """
    body_start = body_start_line(lines)
    first = find_body_h1(lines)
    skip_upto = first[0][0] if first else body_start + 1
    extras = []
    for line_number, line in iter_outside_fences(lines, skip_upto):
        if BODY_H1_PATTERN.match(line):
            extras.append((line_number, line.strip()))
    return extras


def find_private_key(lines: list[str]) -> list[tuple[int, str]]:
    """识别真实私钥：PEM 头后存在成段的 base64 正文，且不含占位标记。"""
    problems: list[tuple[int, str]] = []
    for index, line in enumerate(lines, start=1):
        if not PEM_HEADER_PATTERN.search(line):
            continue
        window = lines[index : index + 5]
        body = [item.strip() for item in window if PEM_BODY_PATTERN.match(item.strip())]
        if not body:
            continue
        if any(marker in item for item in window for marker in PLACEHOLDER_MARKERS):
            continue
        problems.append((index, '疑似真实私钥（示例中的占位内容不会命中）'))
    return problems


def check_file(path: Path, languages: set[str] | None, repo_root: Path) -> list[Finding]:
    text = path.read_text(encoding='utf-8')
    lines = text.splitlines()
    relative = path.relative_to(repo_root)
    findings: list[Finding] = []

    if path.name not in SKIP_FRONTMATTER_CHECK:
        for line_number, field in split_frontmatter(lines):
            if field in ALLOWED_FRONTMATTER_FIELDS:
                continue
            origin = FRAMEWORK_SPECIFIC_FIELDS.get(field)
            suffix = f'（{origin} 特有字段）' if origin else '（非通用字段）'
            findings.append(
                Finding(relative, line_number, 'error', f'front matter 字段 `{field}`{suffix}')
            )

    for line_number, language in find_code_fence_languages(lines, languages):
        findings.append(
            Finding(relative, line_number, 'error', f'代码块语言 `{language}` 不被 Shiki 支持')
        )

    for line_number, target in find_broken_local_links(path, lines, repo_root):
        findings.append(Finding(relative, line_number, 'error', f'本地引用不存在：{target}'))

    if path.name not in SKIP_FRONTMATTER_CHECK:
        for line_number, heading in find_extra_body_h1(lines):
            findings.append(
                Finding(
                    relative,
                    line_number,
                    'error',
                    f'{heading}：页面已有标题区 h1，正文出现多个一级标题；章节标题请降级为二级',
                )
            )
        for line_number, heading, kind in find_body_h1(lines):
            message = (
                '正文以一级标题开头，与页面标题重复，构建期自动移除；'
                '建议改为声明 front matter 的 `title`'
                if kind == 'repeated'
                else '正文首个标题为一级标题，会与页面标题区并列显示；'
                '如为章节标题建议降级为二级标题'
            )
            findings.append(Finding(relative, line_number, 'warning', f'{heading}：{message}'))

    for line_number, message in find_private_key(lines):
        findings.append(Finding(relative, line_number, 'error', message))

    for index, line in enumerate(lines, start=1):
        for pattern, label in SECRET_PATTERNS:
            if re.search(pattern, line):
                findings.append(Finding(relative, index, 'error', f'疑似{label}'))

    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description='文档内容质量门禁')
    parser.add_argument('--root', default='src/content/docs', help='待检查的内容根目录')
    parser.add_argument('files', nargs='*', help='仅检查指定文件，缺省时全量检查')
    parser.add_argument(
        '--require-languages',
        action='store_true',
        help='找不到 Shiki 语言包时按失败处理，用于 CI 防止该检查被静默跳过',
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    root = (repo_root / args.root).resolve()
    if not root.is_dir():
        print(f'内容目录不存在：{root}', file=sys.stderr)
        return 1

    if args.files:
        targets = [(repo_root / item).resolve() for item in args.files]
    else:
        targets = list(iter_markdown_files(root))

    languages = load_shiki_languages(repo_root)
    if languages is None:
        message = '未找到 Shiki 语言包'
        if args.require_languages:
            print(f'{message}，代码块语言检查不可用', file=sys.stderr)
            return 1
        print(f'{message}，跳过代码块语言检查', file=sys.stderr)

    findings: list[Finding] = []
    private_address_files: set[Path] = set()
    private_address_count = 0

    for path in targets:
        if not path.is_file() or not (path.suffix in ('.md', '.mdx')):
            continue
        findings.extend(check_file(path, languages, repo_root))
        relative = path.relative_to(repo_root)
        for line in path.read_text(encoding='utf-8').splitlines():
            if PRIVATE_ADDRESS_PATTERN.search(line):
                private_address_count += 1
                private_address_files.add(relative)

    errors = [item for item in findings if item.level == 'error']
    warnings = [item for item in findings if item.level != 'error']

    for item in errors:
        print(item)
    for item in warnings:
        print(item)

    if private_address_count:
        print(
            f'[提示] 内网地址共 {private_address_count} 处，'
            f'分布于 {len(private_address_files)} 个文件；运维文档中通常为示例配置，不阻断。'
        )

    print(
        f'已检查 {len(targets)} 个文件，错误 {len(errors)} 项，'
        f'提示 {len(warnings)} 项，内网地址提示 {private_address_count} 项。'
    )
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main())
