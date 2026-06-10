#!/usr/bin/env python3
"""
把 articles/golang/*.html 按 manifest 中的三档分组细分到子目录:
  golang/01-basic/        Golang 基础
  golang/02-advanced/     Golang 进阶 (其中 golang/* 部分)
  golang/03-expert/       Golang 高级

跑完会:
  - 移动文件到新子目录
  - 更新每个 html 里的资源路径前缀和 data-current-id / data-base
  - 更新 assets/manifest.js 里的 id

channel/ pulsar/ kafka/ redis/ mysql/ 不动。
"""
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).parent
ARTICLES = ROOT / "articles"

# 分档映射: slug → 新子目录
CATEGORY_MAP = {
    "01-basic": [
        "new-vs-make", "value-vs-reference", "string-internals", "iota",
        "closure", "panic-recover", "error-handling", "init-order",
        "equality", "type-assertion", "interface",
    ],
    "02-advanced": [
        "slice", "map", "defer", "escape-analysis", "struct-alignment",
        "sync-mutex", "sync-waitgroup-once", "sync-pool", "sync-map",
        "atomic-cas", "context", "timer", "range-gotchas", "reflect", "generics",
    ],
    "03-expert": [
        "gpm-scheduler", "gc", "memory-leak", "netpoller", "syscall-handoff",
        "memory-allocator", "stack-management", "pprof", "trace",
        "unsafe-pointer", "cgo",
    ],
}


def slug_to_subdir() -> dict[str, str]:
    out = {}
    for subdir, slugs in CATEGORY_MAP.items():
        for s in slugs:
            out[s] = subdir
    return out


def move_and_rewrite() -> dict[str, str]:
    """返回 old_id -> new_id 的映射,后面更新 manifest 用。"""
    mapping: dict[str, str] = {}
    s2d = slug_to_subdir()

    golang_dir = ARTICLES / "golang"
    files = sorted([p for p in golang_dir.glob("*.html") if p.is_file()])
    if not files:
        print("golang/ 目录下没找到顶层 html, 可能已经迁移过了。")
        return mapping

    for f in files:
        slug = f.stem
        if slug not in s2d:
            print(f"  ! 未在分档映射里找到: {slug}, 跳过")
            continue
        subdir = s2d[slug]
        new_path = golang_dir / subdir / f.name
        new_path.parent.mkdir(parents=True, exist_ok=True)

        text = f.read_text(encoding="utf-8")
        old_id = f"golang/{slug}"
        new_id = f"golang/{subdir}/{slug}"
        mapping[old_id] = new_id

        # 资源前缀: ../../ (深 2) → ../../../ (深 3)
        text = text.replace('href="../../assets/', 'href="../../../assets/')
        text = text.replace('src="../../assets/', 'src="../../../assets/')
        text = text.replace('href="../../index.html"', 'href="../../../index.html"')
        # data-current-id: 旧 id → 新 id
        text = text.replace(
            f'data-current-id="{old_id}"',
            f'data-current-id="{new_id}"',
        )
        # data-base: ../ → ../../
        text = text.replace('data-base="../"', 'data-base="../../"')

        new_path.write_text(text, encoding="utf-8")
        f.unlink()
        print(f"  {old_id}  ->  {new_id}")

    return mapping


def update_manifest(mapping: dict[str, str]) -> None:
    mf = ROOT / "assets" / "manifest.js"
    text = mf.read_text(encoding="utf-8")
    for old, new in mapping.items():
        # 替换 id 字符串字面量
        text = text.replace(f'id: "{old}"', f'id: "{new}"')
    mf.write_text(text, encoding="utf-8")
    print(f"\n已更新 {mf.relative_to(ROOT)}")


def main() -> None:
    mapping = move_and_rewrite()
    print(f"\n共移动 {len(mapping)} 个文件。")
    if mapping:
        update_manifest(mapping)


if __name__ == "__main__":
    main()
