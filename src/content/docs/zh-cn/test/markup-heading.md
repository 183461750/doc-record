# 反引号 `code`、**粗体**、<kbd>Ctrl</kbd> 与 A &amp; B

夹具：本文不声明 front matter，页面标题由 loader 从正文首个 H1 推导，而该 H1 含行内标记、
内联 HTML 与 HTML 实体。标题推导与 remark 插件判定「正文 H1 与页面标题重复」必须用同一条
纯文本规则（见 `shared/markdown-text.js`），否则页面会出现两个标题，或标题里残留
`<kbd>`、`&amp;` 这类标记。

## 二级标题

二级标题应当照常渲染。
