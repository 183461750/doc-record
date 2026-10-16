"""内容脚本共用的清单与规则。

抽出来的原因（代码审查发现项 M9）：豁免清单原本在 `check-content.py`（`SKIP_FRONTMATTER_CHECK`）
与 `normalize-titles.py`（`SKIP_FILES`）各存一份，取值相同但没有任何约束保证它们继续一致 ——
新增一个豁免文件时改一处、漏一处，两个脚本就会对同一份内容给出不同结论。

用法：脚本直接 `from content_rules import SKIP_FILES`（以脚本方式运行时，其所在目录会进入
`sys.path`，无需额外处理）。
"""

from __future__ import annotations

# 不参与 front matter 与正文标题检查、也不参与标题规范化的文件：
#   - SKILL.md 遵循 Agent Skills 规范，其 name / description 字段由该规范定义，
#     不属于站点内容的元数据约定，正文一级标题同样按该规范编写；
#   - index.mdx 是各目录的索引页，`template` / `hero` 属站点级布局配置而非内容元数据，
#     随站点生成器而变。
# 这类文件的正文仍受其他检查项（代码块语言、内网地址、本地链接）约束。
SKIP_FILES = frozenset({'SKILL.md', 'index.mdx'})
