(function () {
  const scriptTag = document.currentScript;
  const currentId = scriptTag.dataset.currentId || null;
  // base: 当前页面到 articles/ 目录的相对路径前缀
  // 首页 index.html  → "articles/"
  // 文章页 articles/<prefix>/<slug>.html → "../"
  const base = scriptTag.dataset.base != null ? scriptTag.dataset.base : (currentId ? "../" : "articles/");

  const manifest = window.MANIFEST;
  const state = { headings: [], tocCollapsed: new Set() };

  function articleHref(id) {
    return `${base}${id}.html`;
  }

  function setSiteHeader() {
    const titleEl = document.querySelector(".site-title");
    const subtitleEl = document.querySelector(".site-subtitle");
    if (titleEl) titleEl.textContent = manifest.site.title;
    if (subtitleEl) subtitleEl.textContent = manifest.site.subtitle || "";
    if (currentId) {
      const item = findItem(currentId);
      document.title = (item ? item.title + " · " : "") + manifest.site.title;
    } else {
      document.title = manifest.site.title;
    }
  }

  function findItem(id) {
    for (const g of manifest.groups) {
      for (const it of g.items) {
        if (it.id === id) return it;
      }
    }
    return null;
  }

  function renderSidebar() {
    const nav = document.getElementById("nav");
    if (!nav) return;
    nav.innerHTML = "";
    for (const group of manifest.groups) {
      const wrap = document.createElement("div");
      wrap.className = "nav-group";
      const title = document.createElement("h3");
      title.className = "nav-group-title";
      title.textContent = group.title;
      wrap.appendChild(title);
      const ul = document.createElement("ul");
      ul.className = "nav-list";
      for (const item of group.items) {
        const li = document.createElement("li");
        li.className = "nav-item";
        li.dataset.id = item.id;
        const a = document.createElement("a");
        a.href = articleHref(item.id);
        a.textContent = item.title;
        if (item.id === currentId) {
          a.addEventListener("click", (e) => {
            e.preventDefault();
            if (state.tocCollapsed.has(item.id)) state.tocCollapsed.delete(item.id);
            else state.tocCollapsed.add(item.id);
            highlightActive();
          });
        }
        li.appendChild(a);
        ul.appendChild(li);
      }
      wrap.appendChild(ul);
      nav.appendChild(wrap);
    }
    highlightActive();
  }

  function stripHtml(s) {
    const d = document.createElement("div");
    d.innerHTML = s;
    return d.textContent || "";
  }

  function renderMarkdown(md) {
    marked.setOptions({ gfm: true, breaks: false });
    let html = marked.parse(md);
    let i = 0;
    state.headings = [];
    html = html.replace(/<(h[1-3])([^>]*)>([\s\S]*?)<\/\1>/g, (m, tag, attrs, inner) => {
      const id = `h-${i++}`;
      const level = parseInt(tag[1], 10);
      state.headings.push({ id, text: stripHtml(inner), level });
      return `<${tag} id="${id}"${attrs}>${inner}</${tag}>`;
    });
    return html;
  }

  function countWords(text) {
    const cjk = (text.match(/[一-鿿㐀-䶿]/g) || []).length;
    const ascii = (text.match(/[A-Za-z0-9_]+/g) || []).length;
    return cjk + ascii;
  }

  function readingMinutes(words) {
    return Math.max(1, Math.round(words / 400));
  }

  function highlightActive() {
    document.querySelectorAll(".nav-item").forEach((li) => {
      const isActive = li.dataset.id === currentId;
      li.classList.toggle("active", isActive);
      li.classList.toggle("collapsed", isActive && state.tocCollapsed.has(li.dataset.id));
      const existing = li.querySelector(".toc");
      if (existing) existing.remove();
      if (isActive && state.headings.length && !state.tocCollapsed.has(li.dataset.id)) {
        const toc = document.createElement("ul");
        toc.className = "toc";
        for (const h of state.headings) {
          if (h.level !== 2) continue;
          const tli = document.createElement("li");
          const ta = document.createElement("a");
          ta.href = `#${h.id}`;
          ta.textContent = "- " + h.text;
          ta.addEventListener("click", (e) => {
            e.preventDefault();
            const el = document.getElementById(h.id);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          tli.appendChild(ta);
          toc.appendChild(tli);
        }
        li.appendChild(toc);
      }
    });
  }

  function renderArticle() {
    const article = document.getElementById("article");
    const meta = document.getElementById("meta");
    const contentScript = document.getElementById("content");
    if (!article) return;

    if (!currentId || !contentScript) {
      // 首页：渲染分类索引
      renderHome(article);
      if (meta) meta.textContent = "";
      return;
    }

    let md = contentScript.textContent || "";
    md = md.replace(/^\n/, "").replace(/\s+$/, "");
    article.innerHTML = renderMarkdown(md);
    if (meta) {
      const words = countWords(md);
      meta.textContent = `${words} 字 · ${readingMinutes(words)} 分钟`;
    }
    highlightActive();
  }

  function renderHome(article) {
    let html = `
      <div class="home-hero">
        <h1>${manifest.site.title}</h1>
        <p>${manifest.site.subtitle || ""}</p>
      </div>
    `;
    for (const g of manifest.groups) {
      html += `<section class="home-group"><h2>${g.title}</h2><ul>`;
      for (const it of g.items) {
        html += `<li><a href="${articleHref(it.id)}">${it.title}</a></li>`;
      }
      html += `</ul></section>`;
    }
    article.innerHTML = html;
  }

  function restoreSidebarScroll() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    const KEY = "kg-sidebar-scroll";
    const saved = sessionStorage.getItem(KEY);
    if (saved !== null) {
      // 整页跳转后恢复上次的侧边栏滚动位置（不再每次回到顶部）
      sidebar.scrollTop = parseInt(saved, 10) || 0;
    } else {
      // 首次进入：把当前文章项滚到可视区中部
      const active = sidebar.querySelector(".nav-item.active");
      if (active) {
        const r = active.getBoundingClientRect();
        const sr = sidebar.getBoundingClientRect();
        sidebar.scrollTop += (r.top - sr.top) - sidebar.clientHeight / 2 + r.height / 2;
      }
    }
    // 滚动时持续记录，供下次整页跳转后恢复
    sidebar.addEventListener("scroll", () => {
      sessionStorage.setItem(KEY, String(Math.round(sidebar.scrollTop)));
    }, { passive: true });
  }

  function setupMobileNav() {
    const sidebar = document.querySelector(".sidebar");
    const header = document.querySelector(".sidebar-header");
    if (!sidebar || !header || header.querySelector(".nav-toggle")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nav-toggle";
    btn.setAttribute("aria-label", "目录");
    const sync = () => {
      btn.textContent = sidebar.classList.contains("open") ? "✕ 关闭" : "☰ 目录";
    };
    btn.addEventListener("click", () => {
      const opening = !sidebar.classList.contains("open");
      sidebar.classList.toggle("open");
      sync();
      if (opening) {
        // 展开时把“当前正在看的文档”那条滚到目录中部，而不是停在最顶上
        const nav = sidebar.querySelector(".nav");
        const active = sidebar.querySelector(".nav-item.active");
        if (nav && active) {
          const cr = nav.getBoundingClientRect();
          const ar = active.getBoundingClientRect();
          nav.scrollTop += (ar.top - cr.top) - nav.clientHeight / 2 + ar.height / 2;
        }
      }
    });
    header.appendChild(btn);
    sync();
  }

  setSiteHeader();
  renderSidebar();
  renderArticle();
  restoreSidebarScroll();
  setupMobileNav();
})();
