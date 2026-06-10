# 知识图谱 · 目录结构

```
interview/
├── index.html               # 首页 (双击直接打开)
├── index.html.bak           # 拆分前的单文件版本备份
├── assets/
│   ├── style.css            # 共享样式
│   ├── manifest.js          # 目录配置 (window.MANIFEST)
│   └── viewer.js            # 渲染侧栏 + markdown
└── articles/                # 每篇文章一个 html, 按命名空间分目录
    ├── pulsar/
    ├── kafka/
    ├── channel/             # channel 相关 (内部并未再分档)
    ├── golang/
    │   ├── 01-basic/        # Golang 基础
    │   ├── 02-advanced/     # Golang 进阶 (golang/* 部分; channel/* 仍在 channel/)
    │   └── 03-expert/       # Golang 高级
    ├── redis/               # 待补
    └── mysql/               # 待补
```

## 怎么看

**双击 `index.html`** 即可，所有文章页都是标准 HTML 文件，不需要起本地服务器。

## 怎么新增一篇文章

**1.** 在 `assets/manifest.js` 对应分组的 `items` 里加一条：

```js
{ id: "redis/data-structures", title: "Redis 基础数据结构" }
// 或 golang 三档:
{ id: "golang/01-basic/foo", title: "..." }
{ id: "golang/02-advanced/bar", title: "..." }
{ id: "golang/03-expert/baz", title: "..." }
```

`id` 直接对应文件路径：`articles/<id>.html`。

**2.** 在对应路径创建文件，复制任何一篇同深度文章作模板：

```bash
# 深 2 层 (例如 channel/, redis/)
cp articles/channel/internals.html articles/redis/data-structures.html

# 深 3 层 (golang 的三档)
cp articles/golang/02-advanced/map.html articles/golang/02-advanced/new-topic.html
```

⚠️ 注意：**深 2 层用 `../../`，深 3 层用 `../../../`**。复制同深度文章可以保证资源前缀对。

然后改：

- `<title>...</title>` — 文章标题
- `data-current-id="..."` — 新 id
- `data-base="..."` — 深 2 层 `../`，深 3 层 `../../`
- `<script id="content" type="text/markdown"> ... </script>` 里替换为新内容

**3.** 完成。刷新首页或直接打开文章页即可。

## 怎么重命名/移动文章

- 在 `manifest.js` 改 `id`
- 在 `articles/` 下把文件搬到对应位置
- 改文件里的 `data-current-id`

## 路径机制

- 文章页的 `assets` 通过 `../../assets/...` 引用（因为文章在 `articles/<ns>/<file>.html`，深 2 层）
- `viewer.js` 用 `data-base` 属性告诉自己「到 articles/ 的相对路径」：
  - 首页：`data-base="articles/"`
  - 文章页：`data-base="../"`
- 侧栏所有文章链接 = `${base}${id}.html`

## 一次性迁移脚本

- `split.py` — 从单文件 `index.html.bak` 拆出 42 篇文章。
- `restructure_golang.py` — 把 golang/ 顶层文件按三档分到 01-basic / 02-advanced / 03-expert。

两个都是一次性迁移脚本，已完成使命。日后新增文章不需要再用，按上面步骤手动加即可。
