#!/usr/bin/env python3
"""
从 index.html.bak 中提取每个 <script type="text/markdown" data-id="..."> 块,
按 data-id 拆分成 articles/<id>.html 独立文件。

新增文章: 自己手动建 articles/<prefix>/<slug>.html 即可,不需要再跑这个脚本。
脚本只是用来一次性迁移的。
"""
import re
import os
from pathlib import Path
from html import escape

ROOT = Path(__file__).parent
SRC = ROOT / "index.html.bak"
OUT_DIR = ROOT / "articles"

TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title_escaped} · 知识图谱</title>
<link rel="stylesheet" href="{prefix}assets/style.css">
</head>
<body>
<div class="layout">
  <aside class="sidebar">
    <div class="sidebar-header">
      <a class="site-title-link" href="{prefix}index.html">
        <h1 class="site-title">知识图谱</h1>
        <p class="site-subtitle">后端工程师 · 速记 / 速答 / 速过</p>
      </a>
    </div>
    <nav class="nav" id="nav"></nav>
  </aside>
  <main class="main">
    <header class="topbar">
      <div class="meta" id="meta"></div>
      <div class="lang">
        <select id="langSelect">
          <option value="zh">中文</option>
          <option value="en" disabled>English</option>
        </select>
      </div>
    </header>
    <article class="article" id="article"></article>
  </main>
</div>
<script id="content" type="text/markdown">
{content}
</script>
<script src="{prefix}assets/manifest.js"></script>
<script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script>
<script src="{prefix}assets/viewer.js" data-current-id="{article_id}" data-base="../"></script>
</body>
</html>
"""


def extract_title(md: str) -> str:
    """从 markdown 第一行的 # 标题里取标题。"""
    for line in md.splitlines():
        m = re.match(r"^#\s+(.+?)\s*$", line)
        if m:
            return m.group(1)
    return "(无标题)"


def main() -> None:
    src_text = SRC.read_text(encoding="utf-8")
    pattern = re.compile(
        r'<script\s+type="text/markdown"\s+data-id="([^"]+)">\s*\n([\s\S]*?)\n</script>',
        re.MULTILINE,
    )
    matches = list(pattern.finditer(src_text))
    print(f"找到 {len(matches)} 篇文章。")

    written = 0
    for m in matches:
        article_id = m.group(1)
        md = m.group(2)
        # 一篇文章在文件系统的位置：articles/<prefix>/<slug>.html
        # 因为 article_id 已经是 "<prefix>/<slug>" 的形式, 直接拼即可。
        rel_path = Path(article_id + ".html")
        depth = len(rel_path.parts) - 1  # 文章相对于 articles/ 的深度
        # 文章页面相对于项目根目录的层级 = articles/ 的 1 层 + depth
        prefix = "../" * (1 + depth)

        out_file = OUT_DIR / rel_path
        out_file.parent.mkdir(parents=True, exist_ok=True)

        title = extract_title(md)
        html = TEMPLATE.format(
            title_escaped=escape(title),
            article_id=article_id,
            prefix=prefix,
            content=md,
        )
        out_file.write_text(html, encoding="utf-8")
        written += 1
        print(f"  -> {out_file.relative_to(ROOT)}  ({title})")

    print(f"\n完成。共写出 {written} 个文件到 articles/")


if __name__ == "__main__":
    main()
