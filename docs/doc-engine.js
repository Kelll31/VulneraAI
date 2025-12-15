/* demo tests\doc-engine.js */
(function (global) {
  "use strict";

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null) return;
        if (k === "text") node.textContent = String(v);
        else if (k === "html") node.innerHTML = String(v);
        else node.setAttribute(k, String(v));
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var child = arguments[i];
      if (child == null) continue;
      if (typeof child === "string") node.appendChild(document.createTextNode(child));
      else node.appendChild(child);
    }
    return node;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");
  }

  function slugify(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replaceAll(/[\s]+/g, "-")
      .replaceAll(/[^\w\-а-яё]/gi, "");
  }

  function parseRoute(hash) {
    var h = (hash || "").trim();
    if (!h) return { name: "home" };
    if (h[0] === "#") h = h.slice(1);

    var parts = h.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0] === "page") {
      return { name: "page", id: decodeURIComponent(parts[1]) };
    }
    return { name: "home" };
  }

  async function fetchJson(url) {
    var res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Не удалось загрузить JSON: " + url + " (HTTP " + res.status + ")");
    return await res.json();
  }

  function joinUrl(dir, file) {
    if (!dir) return file;
    if (/^(https?:)?\/\//i.test(file)) return file;
    if (file.startsWith("/") || file.startsWith("./") || file.startsWith("../")) return file;
    return dir.replace(/\/+$/, "") + "/" + file.replace(/^\/+/, "");
  }

  function safeMarked(md) {
    if (global.marked && typeof global.marked.parse === "function") {
      return global.marked.parse(String(md || ""));
    }
    return "<pre>" + escapeHtml(md || "") + "</pre>";
  }

  function sanitize(html) {
    if (global.DOMPurify && typeof global.DOMPurify.sanitize === "function") {
      return global.DOMPurify.sanitize(String(html || ""), { USE_PROFILES: { html: true } });
    }
    return String(html || "");
  }

  function sortPages(pages) {
    return (pages || []).slice().sort(function (a, b) {
      var ao = (a && typeof a.order === "number") ? a.order : 999999;
      var bo = (b && typeof b.order === "number") ? b.order : 999999;
      if (ao !== bo) return ao - bo;
      var at = (a && a.title) ? a.title : "";
      var bt = (b && b.title) ? b.title : "";
      return at.localeCompare(bt, "ru");
    });
  }

  function normalizePath(p) {
    if (!p) return [];
    if (Array.isArray(p)) return p.map(function (x) { return String(x); }).filter(Boolean);
    return [String(p)];
  }

  function folderKeyFromPath(pathArr) {
    return pathArr.map(function (s) { return slugify(s); }).join("/");
  }

  function buildTree(pages) {
    var root = { type: "folder", title: "", key: "", children: [] };
    var folderMap = new Map();
    folderMap.set("", root);

    function ensureFolder(parentKey, title, fullKey) {
      if (folderMap.has(fullKey)) return folderMap.get(fullKey);
      var node = { type: "folder", title: title, key: fullKey, children: [] };
      folderMap.set(fullKey, node);
      var parent = folderMap.get(parentKey);
      parent.children.push(node);
      return node;
    }

    pages.forEach(function (page) {
      var path = normalizePath(page.path);
      var parentKey = "";
      var accumPath = [];
      for (var i = 0; i < path.length; i++) {
        accumPath.push(path[i]);
        var fullKey = folderKeyFromPath(accumPath);
        ensureFolder(parentKey, path[i], fullKey);
        parentKey = fullKey;
      }
      var parentFolder = folderMap.get(parentKey) || root;
      parentFolder.children.push({ type: "page", page: page });
    });

    function sortNode(node) {
      node.children.sort(function (a, b) {
        if (a.type !== b.type) return (a.type === "folder") ? -1 : 1;
        if (a.type === "folder") return a.title.localeCompare(b.title, "ru");
        var pa = a.page, pb = b.page;
        var ao = (pa && typeof pa.order === "number") ? pa.order : 999999;
        var bo = (pb && typeof pb.order === "number") ? pb.order : 999999;
        if (ao !== bo) return ao - bo;
        return String(pa.title || pa.id).localeCompare(String(pb.title || pb.id), "ru");
      });
      node.children.forEach(function (c) { if (c.type === "folder") sortNode(c); });
    }

    sortNode(root);
    return root;
  }

  function parseDocsIndex(indexJson) {
    // 1) ["a.json","b.json"]
    // 2) {files:[...]} или {docs:[...]}
    // элемент: строка или объект {file, pathPrefix?, namespace?}
    var list = null;

    if (Array.isArray(indexJson)) list = indexJson;
    else if (indexJson && Array.isArray(indexJson.files)) list = indexJson.files;
    else if (indexJson && Array.isArray(indexJson.docs)) list = indexJson.docs;

    if (!list) throw new Error("Неверный формат docs/docs_index.json: ожидается массив или объект {files:[...]}");

    return list.map(function (item) {
      if (typeof item === "string") return { file: item };
      if (item && typeof item === "object" && typeof item.file === "string") {
        return {
          file: item.file,
          pathPrefix: Array.isArray(item.pathPrefix) ? item.pathPrefix.map(String) : null,
          namespace: (typeof item.namespace === "string" && item.namespace.trim()) ? item.namespace.trim() : null
        };
      }
      throw new Error("Неверный элемент в docs/docs_index.json (ожидается строка или {file,...})");
    });
  }

  function ensureUniquePageId(rawId, used, namespace) {
    var base = String(rawId || "").trim();
    if (!base) base = "page-" + Math.random().toString(16).slice(2);
    if (!used.has(base)) { used.add(base); return base; }

    if (namespace) {
      var ns = String(namespace).trim();
      var candidate = ns + ":" + base;
      if (!used.has(candidate)) { used.add(candidate); return candidate; }
      var i = 2;
      while (used.has(candidate + "-" + i)) i++;
      used.add(candidate + "-" + i);
      return candidate + "-" + i;
    }

    var j = 2;
    while (used.has(base + "-" + j)) j++;
    used.add(base + "-" + j);
    return base + "-" + j;
  }

  async function loadAllDocs(options) {
    // A: один файл
    if (options.jsonUrl) {
      var single = await fetchJson(options.jsonUrl);
      return {
        siteTitle: single.siteTitle || options.title || "Документация",
        pages: Array.isArray(single.pages) ? single.pages : []
      };
    }

    // B: index + много файлов
    var docsDir = options.docsDir || "./docs";
    var docsIndexUrl = options.docsIndexUrl || joinUrl(docsDir, "docs_index.json");
    var idx = await fetchJson(docsIndexUrl);
    var entries = parseDocsIndex(idx);

    var docs = await Promise.all(entries.map(async function (entry) {
      var url = joinUrl(docsDir, entry.file);
      var data = await fetchJson(url);
      return { url: url, entry: entry, data: data };
    }));

    var usedIds = new Set();
    var allPages = [];
    var siteTitle = options.title || "Документация";

    docs.forEach(function (d) {
      if (!siteTitle && d.data && d.data.siteTitle) siteTitle = d.data.siteTitle;
      if (d.data && d.data.siteTitle && siteTitle === (options.title || "Документация")) {
        siteTitle = d.data.siteTitle;
      }

      var pages = Array.isArray(d.data && d.data.pages) ? d.data.pages : [];
      pages.forEach(function (p) {
        var page = Object.assign({}, p);

        var prefix = d.entry.pathPrefix ? d.entry.pathPrefix : null;
        if (prefix && prefix.length) page.path = prefix.concat(normalizePath(page.path));

        var ns = d.entry.namespace;
        if (!ns) {
          var fileBase = String(d.entry.file || "").split("/").pop();
          ns = (fileBase ? fileBase.replace(/\.json$/i, "") : null);
        }

        var rawId = page.id || slugify(page.title || "") || "";
        page.id = ensureUniquePageId(rawId, usedIds, ns);

        if (!page.title) page.title = page.id;
        if (typeof page.order !== "number") page.order = 999999;

        allPages.push(page);
      });
    });

    return { siteTitle: siteTitle, pages: allPages };
  }

  // ---------- Full-text search helpers ----------
  function toPlainTextFromHtml(html) {
    try {
      var parser = new DOMParser();
      var doc = parser.parseFromString(String(html || ""), "text/html");
      return (doc && doc.body && doc.body.textContent) ? doc.body.textContent : "";
    } catch (_) {
      return "";
    }
  }

  function toPlainTextFromMarkdown(md) {
    var html = safeMarked(md || "");
    return toPlainTextFromHtml(html);
  }

  function normalizeQuery(q) {
    q = String(q || "").trim().toLowerCase();
    q = q.replaceAll(/\s+/g, " ");
    return q;
  }

  function splitTerms(q) {
    q = normalizeQuery(q);
    if (!q) return [];
    return q.split(" ").map(function (t) { return t.trim(); }).filter(function (t) { return t.length >= 2; });
  }

  function countOccurrences(hay, needle) {
    if (!needle) return 0;
    var count = 0;
    var pos = 0;
    while (true) {
      var idx = hay.indexOf(needle, pos);
      if (idx === -1) break;
      count++;
      pos = idx + needle.length;
    }
    return count;
  }

  function makeSnippet(text, queryLower, radius) {
    radius = (typeof radius === "number") ? radius : 80;
    var t = String(text || "");
    var low = t.toLowerCase();
    var idx = low.indexOf(queryLower);
    if (idx === -1) return "";

    var start = Math.max(0, idx - radius);
    var end = Math.min(t.length, idx + queryLower.length + radius);
    var prefix = (start > 0) ? "…" : "";
    var suffix = (end < t.length) ? "…" : "";

    var snip = t.slice(start, end).replaceAll(/\s+/g, " ").trim();
    return prefix + snip + suffix;
  }

  function highlightTextNodes(container, terms) {
    if (!container || !terms || !terms.length) return 0;

    var totalMarks = 0;

    function makeWalker(root) {
      return document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function (node) {
            if (!node || !node.nodeValue) return NodeFilter.FILTER_REJECT;

            var p = node.parentNode;
            if (!p || !p.tagName) return NodeFilter.FILTER_ACCEPT;

            var tag = p.tagName.toUpperCase();
            if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
            if (tag === "CODE" || tag === "PRE" || tag === "MARK") return NodeFilter.FILTER_REJECT;
            if (p.closest && p.closest("code, pre, mark")) return NodeFilter.FILTER_REJECT;

            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );
    }

    function replaceNodeWithHighlighted(node, termLower) {
      var text = node.nodeValue;
      var low = text.toLowerCase();
      var idx = low.indexOf(termLower);
      if (idx === -1) return false;

      var frag = document.createDocumentFragment();
      var last = 0;

      while (idx !== -1) {
        if (idx > last) frag.appendChild(document.createTextNode(text.slice(last, idx)));

        var m = document.createElement("mark");
        m.textContent = text.slice(idx, idx + termLower.length);
        frag.appendChild(m);
        totalMarks++;

        last = idx + termLower.length;
        idx = low.indexOf(termLower, last);
      }

      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));

      node.parentNode.replaceChild(frag, node);
      return true;
    }

    terms.forEach(function (term) {
      if (!term) return;

      var tw = makeWalker(container);
      var list = [];
      var x;
      while ((x = tw.nextNode())) list.push(x);

      list.forEach(function (node) {
        replaceNodeWithHighlighted(node, term.toLowerCase());
      });
    });

    return totalMarks;
  }
  // ---------- /Full-text search helpers ----------

  function mount(options) {
    options = options || {};
    var mountEl = (typeof options.mount === "string") ? qs(options.mount) : options.mount;
    if (!mountEl) throw new Error("DocEngine: mount element not found");

    var title = options.title || "Документация";
    var storageKey = options.storageKey || "doc_engine";
    var storageOpenKey = storageKey + ":openFolders";
    var storageNavKey = storageKey + ":navCollapsed";

    mountEl.innerHTML = "";
    var root = el("div", { "data-doc-engine": "1", class: "doc-root" });

    // topbar
    var topbar = el("header", { class: "doc-topbar" });

    var leftBlock = el("div", { class: "doc-topbar-left" });
    var btnNav = el("button", { type: "button", class: "doc-btn-nav", text: "Меню" });
    var brand = el("div", { class: "doc-brand", text: title });
    leftBlock.appendChild(btnNav);
    leftBlock.appendChild(brand);

    var midBlock = el("div", { class: "doc-topbar-mid" });
    var breadcrumbs = el("div", { class: "doc-breadcrumbs", text: "" });
    midBlock.appendChild(breadcrumbs);

    var rightBlock = el("div", { class: "doc-topbar-right" });

    // Обёртка для dropdown под инпутом (делаем минимальную раскладку прямо JS-ом)
    var searchWrap = el("div", { class: "doc-search-wrap" });
    searchWrap.style.position = "relative";
    searchWrap.style.minWidth = "0";

    var search = el("input", {
      class: "doc-search",
      type: "search",
      placeholder: "Поиск по заголовкам и тексту…",
      autocomplete: "off",
      spellcheck: "false",
      "aria-label": "Поиск по страницам и тексту статей"
    });

    var dd = el("div", { class: "doc-search-dd", role: "listbox" });
    // минимальные стили (не “дизайн”, а чтобы реально было “под строкой поиска”)
    dd.style.position = "absolute";
    dd.style.left = "0";
    dd.style.right = "0";
    dd.style.top = "calc(100% + 6px)";
    dd.style.zIndex = "9999";
    dd.style.display = "none";
    dd.style.maxHeight = "55vh";
    dd.style.overflow = "auto";
    dd.style.border = "1px solid rgba(255,255,255,0.12)";
    dd.style.background = "rgba(15,20,27,0.98)";

    searchWrap.appendChild(search);
    searchWrap.appendChild(dd);
    rightBlock.appendChild(searchWrap);

    topbar.appendChild(leftBlock);
    topbar.appendChild(midBlock);
    topbar.appendChild(rightBlock);

    // columns
    var cols = el("div", { class: "doc-cols" });

    var nav = el("nav", { class: "doc-nav" });
    var navHeader = el("div", { class: "doc-nav-header", text: "Разделы" });
    var navBody = el("div", { class: "doc-nav-body" });
    nav.appendChild(navHeader);
    nav.appendChild(navBody);

    var content = el("main", { class: "doc-content" });

    var pageHead = el("div", { class: "doc-page-head" });
    var pageTitle = el("h1", { class: "doc-page-title", text: "" });
    var pageMeta = el("div", { class: "doc-page-meta", text: "" });
    pageHead.appendChild(pageTitle);
    pageHead.appendChild(pageMeta);

    var toc = el("nav", { class: "doc-toc" });
    var tocTitle = el("div", { class: "doc-toc-title", text: "Содержание" });
    var tocList = el("ul", { class: "doc-toc-list" });
    toc.appendChild(tocTitle);
    toc.appendChild(tocList);

    var article = el("article", { class: "doc-article" });

    content.appendChild(pageHead);
    content.appendChild(article);
    content.appendChild(toc);

    cols.appendChild(nav);
    cols.appendChild(content);

    root.appendChild(topbar);
    root.appendChild(cols);
    mountEl.appendChild(root);

    // state
    var state = {
      data: null,
      pages: [],
      pagesById: new Map(),
      tree: null,
      openFolders: new Set(),
      currentPageId: null,

      // full-text index:
      searchIndex: [], // {id, title, pathText, plainText, ...lower}
      currentPageHtml: "",
      currentSearchQuery: "",

      // dropdown results:
      ddHits: [], // array of {id, score, snippet}
      ddActive: -1,
      ddOpen: false
    };

    function loadOpenFolders() {
      try {
        var raw = localStorage.getItem(storageOpenKey);
        if (!raw) return;
        var arr = JSON.parse(raw);
        if (Array.isArray(arr)) arr.forEach(function (k) { state.openFolders.add(String(k)); });
      } catch (_) { }
    }

    function saveOpenFolders() {
      try {
        localStorage.setItem(storageOpenKey, JSON.stringify(Array.from(state.openFolders)));
      } catch (_) { }
    }

    function loadNavCollapsed() {
      try { return localStorage.getItem(storageNavKey) === "1"; } catch (_) { return false; }
    }

    function saveNavCollapsed(v) {
      try { localStorage.setItem(storageNavKey, v ? "1" : "0"); } catch (_) { }
    }

    // ---------- Smooth nav animation ----------
    var navAnimMs = (typeof options.navAnimMs === "number") ? options.navAnimMs : 220;
    var navExpandedPx = null;
    var navEndHandler = null;

    function prefersReducedMotion() {
      try {
        return global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
      } catch (_) {
        return false;
      }
    }

    function getExpandedWidthPx() {
      if (navExpandedPx != null) return navExpandedPx;

      var rect = nav.getBoundingClientRect();
      var w = rect && rect.width ? rect.width : 0;

      if (!w) {
        try {
          var v = getComputedStyle(document.documentElement).getPropertyValue("--nav-w").trim();
          if (v.endsWith("px")) w = parseFloat(v);
        } catch (_) { }
      }
      if (!w) w = 320;

      navExpandedPx = Math.max(240, Math.round(w));
      return navExpandedPx;
    }

    function clearNavInlineStyles() {
      nav.style.transition = "";
      nav.style.width = "";
      nav.style.opacity = "";
      nav.style.overflow = "";
      nav.style.pointerEvents = "";
      cols.style.transition = "";
      cols.style.gridTemplateColumns = "";
    }

    function stopNavAnimation() {
      if (navEndHandler) {
        nav.removeEventListener("transitionend", navEndHandler);
        navEndHandler = null;
      }
    }

    function setNavCollapsed(v, opts) {
      opts = opts || {};
      v = !!v;

      var immediate = !!opts.immediate || prefersReducedMotion() || navAnimMs <= 0;
      if (immediate) {
        stopNavAnimation();
        clearNavInlineStyles();
        root.classList.toggle("nav-collapsed", v);
        saveNavCollapsed(v);
        return;
      }

      stopNavAnimation();

      var w = getExpandedWidthPx();

      clearNavInlineStyles();
      root.classList.toggle("nav-collapsed", false);

      nav.style.overflow = "hidden";
      cols.style.transition = "grid-template-columns " + navAnimMs + "ms ease";
      nav.style.transition =
        "width " + navAnimMs + "ms ease, " +
        "opacity " + Math.max(120, Math.floor(navAnimMs * 0.75)) + "ms ease";

      var currentlyCollapsed = false;
      try { currentlyCollapsed = (Math.round(nav.getBoundingClientRect().width) <= 1); } catch (_) { currentlyCollapsed = false; }

      if (currentlyCollapsed) {
        cols.style.gridTemplateColumns = "0px minmax(0, 1fr)";
        nav.style.width = "0px";
        nav.style.opacity = "0";
        nav.style.pointerEvents = "none";
      } else {
        cols.style.gridTemplateColumns = w + "px minmax(0, 1fr)";
        nav.style.width = w + "px";
        nav.style.opacity = "1";
        nav.style.pointerEvents = "auto";
      }

      void nav.offsetWidth;

      if (v) {
        cols.style.gridTemplateColumns = "0px minmax(0, 1fr)";
        nav.style.width = "0px";
        nav.style.opacity = "0";
        nav.style.pointerEvents = "none";
      } else {
        cols.style.gridTemplateColumns = w + "px minmax(0, 1fr)";
        nav.style.width = w + "px";
        nav.style.opacity = "1";
        nav.style.pointerEvents = "auto";
      }

      navEndHandler = function (e) {
        if (!e || e.propertyName !== "width") return;
        stopNavAnimation();
        root.classList.toggle("nav-collapsed", v);
        saveNavCollapsed(v);
        clearNavInlineStyles();
      };

      nav.addEventListener("transitionend", navEndHandler);
    }

    btnNav.addEventListener("click", function () {
      setNavCollapsed(!root.classList.contains("nav-collapsed"));
    });
    // ---------- /Smooth nav animation ----------

    function setDocTitle(txt) {
      var base = (state.data && state.data.siteTitle) ? state.data.siteTitle : title;
      document.title = txt ? (txt + " — " + base) : base;
    }

    function setBreadcrumbs(pathArr, leafTitle) {
      var parts = []
        .concat(pathArr || [])
        .filter(Boolean)
        .map(function (s) { return String(s); });
      if (leafTitle) parts.push(String(leafTitle));
      breadcrumbs.textContent = parts.join(" / ");
      pageMeta.textContent = (pathArr && pathArr.length) ? pathArr.join(" / ") : "";
    }

    function buildSearchIndex() {
      state.searchIndex = state.pages.map(function (p) {
        var pathArr = normalizePath(p.path);
        var pathText = pathArr.join(" / ");
        var plain = toPlainTextFromMarkdown(p.content || "");

        return {
          id: p.id,
          title: p.title || p.id,
          pathText: pathText,
          plainText: plain,

          idLower: String(p.id || "").toLowerCase(),
          titleLower: String(p.title || p.id || "").toLowerCase(),
          pathLower: String(pathText || "").toLowerCase(),
          textLower: String(plain || "").toLowerCase()
        };
      });
    }

    function computeSearchResults(query) {
      query = normalizeQuery(query);
      if (!query) return [];

      var terms = splitTerms(query);
      if (!terms.length) return [];

      var res = [];
      state.searchIndex.forEach(function (idx) {
        var score = 0;

        terms.forEach(function (t) {
          if (idx.titleLower.includes(t)) score += 40 * Math.min(3, countOccurrences(idx.titleLower, t));
          if (idx.pathLower.includes(t)) score += 10 * Math.min(3, countOccurrences(idx.pathLower, t));
          if (idx.idLower.includes(t)) score += 8 * Math.min(3, countOccurrences(idx.idLower, t));
          if (idx.textLower.includes(t)) score += 2 * Math.min(20, countOccurrences(idx.textLower, t));
        });

        if (score <= 0) return;

        var snippet = makeSnippet(idx.plainText, terms[0], 90) || "";
        res.push({ id: idx.id, score: score, snippet: snippet });
      });

      res.sort(function (a, b) { return b.score - a.score; });
      return res.slice(0, (typeof options.searchLimit === "number") ? options.searchLimit : 12);
    }

    function applyHighlightIfNeeded() {
      var q = normalizeQuery(state.currentSearchQuery);
      var terms = splitTerms(q);
      if (!terms.length) return;

      if (state.currentPageHtml) article.innerHTML = state.currentPageHtml;
      highlightTextNodes(article, terms);
    }

    function openPageById(id) {
      if (!id) return;
      location.hash = "#/page/" + encodeURIComponent(id);
    }

    // ---------- Dropdown UI ----------
    function ddClose() {
      state.ddOpen = false;
      state.ddHits = [];
      state.ddActive = -1;
      dd.innerHTML = "";
      dd.style.display = "none";
    }

    function ddOpenWithHits(hits) {
      state.ddHits = hits || [];
      state.ddActive = (state.ddHits.length ? 0 : -1);
      state.ddOpen = !!state.ddHits.length;

      dd.innerHTML = "";
      if (!state.ddHits.length) {
        dd.style.display = "none";
        return;
      }

      // header (optional)
      var head = el("div", { class: "doc-search-dd-head", text: "Результаты" });
      head.style.padding = "8px 10px";
      head.style.fontSize = "12px";
      head.style.opacity = "0.8";
      dd.appendChild(head);

      state.ddHits.forEach(function (hit, idx) {
        var page = state.pagesById.get(hit.id);
        if (!page) return;

        var item = el("div", { class: "doc-search-dd-item", role: "option" });
        item.setAttribute("data-idx", String(idx));
        item.style.padding = "8px 10px";
        item.style.cursor = "pointer";
        item.style.borderTop = "1px solid rgba(255,255,255,0.07)";

        var path = normalizePath(page.path);
        var prefix = path.length ? (path.join(" / ") + " / ") : "";
        var titleText = prefix + (page.title || page.id);

        var t = el("div", { class: "doc-search-dd-title", text: titleText });
        t.style.fontSize = "13px";
        t.style.lineHeight = "1.25";

        item.appendChild(t);

        if (hit.snippet) {
          var s = el("div", { class: "doc-search-dd-snippet", text: hit.snippet });
          s.style.fontSize = "12px";
          s.style.opacity = "0.8";
          s.style.marginTop = "4px";
          item.appendChild(s);
        }

        dd.appendChild(item);
      });

      dd.style.display = "block";
      ddSyncActive();
    }

    function ddSyncActive() {
      var items = qsa(".doc-search-dd-item", dd);
      items.forEach(function (it) {
        var idx = parseInt(it.getAttribute("data-idx") || "-1", 10);
        var active = (idx === state.ddActive);
        it.classList.toggle("is-active", active);
        it.style.background = active ? "rgba(255,255,255,0.06)" : "transparent";
      });

      // прокрутка активного внутрь
      var activeEl = dd.querySelector('.doc-search-dd-item[data-idx="' + state.ddActive + '"]');
      if (activeEl && typeof activeEl.scrollIntoView === "function") {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }

    function ddMove(delta) {
      if (!state.ddOpen || !state.ddHits.length) return;
      var next = state.ddActive + delta;
      if (next < 0) next = 0;
      if (next >= state.ddHits.length) next = state.ddHits.length - 1;
      state.ddActive = next;
      ddSyncActive();
    }

    function ddSelectActive() {
      if (!state.ddHits.length) return false;
      var idx = (state.ddActive >= 0) ? state.ddActive : 0;
      var hit = state.ddHits[idx];
      if (!hit) return false;

      openPageById(hit.id);
      ddClose();
      // фокус оставим в поиске, чтобы можно было продолжать
      try { search.focus(); } catch (_) { }
      return true;
    }

    // клики по dropdown
    dd.addEventListener("mousedown", function (e) {
      // mousedown, чтобы успеть перейти до blur инпута
      var t = e.target;
      var item = t && t.closest ? t.closest(".doc-search-dd-item") : null;
      if (!item) return;

      e.preventDefault();
      var idx = parseInt(item.getAttribute("data-idx") || "-1", 10);
      if (idx >= 0 && idx < state.ddHits.length) {
        state.ddActive = idx;
        ddSelectActive();
      }
    });

    // закрытие по клику вне
    document.addEventListener("mousedown", function (e) {
      if (!state.ddOpen) return;
      var target = e.target;
      if (searchWrap.contains(target)) return;
      ddClose();
    });

    // закрытие по уходу фокуса (если фокус ушёл не внутрь searchWrap)
    search.addEventListener("focusout", function (e) {
      // relatedTarget может быть null (нормально)
      var to = e.relatedTarget;
      if (to && searchWrap.contains(to)) return;
      // небольшой таймаут, чтобы mousedown успел отработать
      setTimeout(function () {
        if (!document.activeElement || !searchWrap.contains(document.activeElement)) ddClose();
      }, 60);
    });

    // ---------- /Dropdown UI ----------

    function renderTreeNode(node, parentUl) {
      if (node.type === "folder") {
        var li = el("li", { class: "doc-nav-folder", "data-folder": node.key });
        var row = el("div", { class: "doc-nav-row" });

        var btn = el("button", {
          type: "button",
          class: "doc-nav-toggle",
          "data-action": "toggle-folder",
          "data-folder": node.key,
          text: state.openFolders.has(node.key) ? "▾" : "▸"
        });

        var label = el("span", { class: "doc-nav-label", text: node.title });
        row.appendChild(btn);
        row.appendChild(label);

        var ul = el("ul", { class: "doc-nav-children" });

        li.classList.toggle("is-open", state.openFolders.has(node.key));
        li.appendChild(row);
        li.appendChild(ul);

        parentUl.appendChild(li);
        node.children.forEach(function (ch) { renderTreeNode(ch, ul); });
        return;
      }

      var p = node.page;
      var liP = el("li", { class: "doc-nav-page" });
      liP.classList.toggle("is-active", state.currentPageId === p.id);

      var a = el("a", {
        class: "doc-nav-link",
        href: "#/page/" + encodeURIComponent(p.id),
        text: p.title || p.id
      });

      liP.appendChild(a);
      parentUl.appendChild(liP);
    }

    function renderNav() {
      navBody.innerHTML = "";
      var ul = el("ul", { class: "doc-nav-tree" });
      state.tree.children.forEach(function (ch) { renderTreeNode(ch, ul); });
      navBody.appendChild(ul);
    }

    nav.addEventListener("click", function (e) {
      var t = e.target;
      if (!t) return;

      if (t.getAttribute && t.getAttribute("data-action") === "toggle-folder") {
        e.preventDefault();
        var key = t.getAttribute("data-folder") || "";
        if (!key) return;

        if (state.openFolders.has(key)) state.openFolders.delete(key);
        else state.openFolders.add(key);

        saveOpenFolders();
        renderNav();
      }
    });

    // Поиск: выдача в dropdown + подсветка в текущей статье
    search.addEventListener("input", function () {
      state.currentSearchQuery = search.value || "";
      var q = normalizeQuery(state.currentSearchQuery);

      if (!splitTerms(q).length) {
        ddClose();
        if (state.currentPageHtml) article.innerHTML = state.currentPageHtml;
        return;
      }

      var hits = computeSearchResults(q);
      ddOpenWithHits(hits);

      // подсветить только в открытой статье
      if (state.currentPageId) applyHighlightIfNeeded();
    });

    // Enter -> перейти на первый/активный результат, стрелки -> выбор, Esc -> закрыть
    search.addEventListener("keydown", function (e) {
      var key = e.key;

      if (key === "ArrowDown") {
        if (!state.ddOpen) {
          var hits = computeSearchResults(search.value || "");
          ddOpenWithHits(hits);
        } else {
          ddMove(+1);
        }
        e.preventDefault();
        return;
      }

      if (key === "ArrowUp") {
        if (state.ddOpen) ddMove(-1);
        e.preventDefault();
        return;
      }

      if (key === "Escape") {
        ddClose();
        e.preventDefault();
        return;
      }

      if (key === "Enter") {
        if (state.ddOpen && state.ddHits.length) {
          ddSelectActive();
          e.preventDefault();
          return;
        }
        // если dropdown закрыт, объяснимо: пробуем открыть и выбрать первый
        var hits2 = computeSearchResults(search.value || "");
        if (hits2.length) {
          ddOpenWithHits(hits2);
          ddSelectActive();
          e.preventDefault();
        }
      }
    });

    function buildTocFromArticle() {
      tocList.innerHTML = "";
      var heads = qsa("h2, h3", article);
      if (!heads.length) {
        toc.classList.toggle("is-empty", true);
        return;
      }
      toc.classList.toggle("is-empty", false);

      heads.forEach(function (h, idx) {
        if (!h.id) h.id = "h-" + idx + "-" + slugify(h.textContent);
        var li = el("li", { class: "doc-toc-item" });
        li.classList.toggle("lvl-3", h.tagName === "H3");
        var a = el("a", { href: "#", text: h.textContent });
        a.setAttribute("data-scroll-id", h.id);
        li.appendChild(a);
        tocList.appendChild(li);
      });
    }

    toc.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || t.tagName !== "A") return;
      var id = t.getAttribute("data-scroll-id");
      if (!id) return;

      e.preventDefault();
      var target = document.getElementById(id);
      if (target && typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    function renderNotFound() {
      state.currentPageId = null;
      state.currentPageHtml = "";
      pageTitle.textContent = "Страница не найдена";
      setBreadcrumbs([], "");
      article.innerHTML = sanitize("<p>Проверьте ссылку и попробуйте снова.</p>");
      tocList.innerHTML = "";
      toc.classList.toggle("is-empty", true);
      setDocTitle("Не найдено");
      renderNav();
    }

    function renderPageById(id) {
      var page = state.pagesById.get(id);
      if (!page) return renderNotFound();

      state.currentPageId = id;

      pageTitle.textContent = page.title || page.id;
      var pathArr = normalizePath(page.path);
      setBreadcrumbs(pathArr, page.title || page.id);
      setDocTitle(page.title || page.id);

      var html = safeMarked(page.content || "");
      state.currentPageHtml = sanitize(html);
      article.innerHTML = state.currentPageHtml;

      if (pathArr.length) {
        for (var i = 0; i < pathArr.length; i++) {
          var key = folderKeyFromPath(pathArr.slice(0, i + 1));
          if (key) state.openFolders.add(key);
        }
        saveOpenFolders();
      }

      buildTocFromArticle();

      if (splitTerms(state.currentSearchQuery).length) applyHighlightIfNeeded();
      renderNav();
    }

    function handleRoute() {
      var route = parseRoute(location.hash);
      if (route.name === "page") {
        renderPageById(route.id);
        return;
      }
      if (state.pages.length) {
        location.hash = "#/page/" + encodeURIComponent(state.pages[0].id);
      } else {
        state.currentPageId = null;
        state.currentPageHtml = "";
        pageTitle.textContent = "Пусто";
        setBreadcrumbs([], "");
        article.innerHTML = sanitize("<p>В документации нет страниц.</p>");
        tocList.innerHTML = "";
        toc.classList.toggle("is-empty", true);
        setDocTitle("");
        renderNav();
      }
    }

    // init
    loadOpenFolders();
    setNavCollapsed(loadNavCollapsed(), { immediate: true });

    pageTitle.textContent = "Загрузка…";
    article.innerHTML = sanitize("<p>Загрузка…</p>");
    toc.classList.toggle("is-empty", true);

    loadAllDocs(options)
      .then(function (bundle) {
        state.data = { siteTitle: bundle.siteTitle || title };
        state.pages = sortPages(bundle.pages || []);
        state.pagesById = new Map(state.pages.map(function (p) { return [p.id, p]; }));
        state.tree = buildTree(state.pages);

        if (state.data.siteTitle) brand.textContent = state.data.siteTitle;

        buildSearchIndex();

        window.addEventListener("hashchange", handleRoute);
        renderNav();
        handleRoute();
      })
      .catch(function (err) {
        state.currentPageId = null;
        state.currentPageHtml = "";
        pageTitle.textContent = "Ошибка загрузки";
        setBreadcrumbs([], "");
        article.innerHTML = sanitize(
          "<p><b>Ошибка:</b> " + escapeHtml(String(err && err.message ? err.message : err)) + "</p>" +
          "<p>Проверь, что существует <code>docs/docs_index.json</code> и в нём перечислены все <code>docs/*.json</code>.</p>"
        );
        tocList.innerHTML = "";
        toc.classList.toggle("is-empty", true);
        setDocTitle("Ошибка");
        renderNav();
      });
  }

  global.DocEngine = { mount: mount };
})(window);
