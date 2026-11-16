# M.T.A. Lab — Articles • AI • Prompts • Knowledge

Personal publishing platform by **Mohamed Tarek Abdelhady**: AI articles, tutorials, tools, prompt collections, engineering content and downloadable resources.
**Only HTML + CSS + Vanilla JavaScript.** No frameworks, no backend. Open `index.html` — no server needed. Arabic (RTL) + English (LTR).

*"Building at the intersection of hardware, software and AI."*

## Structure

```
public/article/
├── index.html
├── css/ (style.css, responsive.css, admin.css)
├── js/ (app.js, router.js, storage.js, resources.js, prompts.js, tools.js, admin.js, search.js, analytics.js, i18n.js, ui.js)
├── data/demo-data.js
├── assets/files/
└── sitemap.xml, robots.txt, README.md
```

## Routes (hash)

`#/home` `#/articles` `#/article…` via `#/resource/:slug` `#/prompts` `#/tools` `#/resources` `#/category/:id` `#/about` `#/downloads` `#/saved` `#/search?q=` `#/admin`

Flow: **DISCOVER → READ → COPY PROMPT → DOWNLOAD → SAVE ♥**

## Features

- Articles library (search + category chips + sorting), rich article pages (TOC, code, prompt blocks, tips, related).
- Prompt library with copy buttons (`تم النسخ ✓` + toast), multi-prompt + copy-all per article.
- Tools directory with pricing + official links. Resources hub with **real files** in `assets/files/` + useful links.
- Category pages, global EN/AR search with highlights, bookmarks (`#/saved`), local analytics with CSS charts.
- Admin (`#/admin`): full CRUD (add/edit/delete/duplicate/publish/feature) for all content, visual block + prompt editors, file metadata manager, categories, settings, `mta-lab-data.json` export/import with validation.

## Static limits (honest)

localStorage is per-browser (no sync); admin gate is client-side only; big files live in `assets/files/` (browser can't upload to a server).

## Deploy

Copy the folder to any static host. No build step; hash routing works on `file://`.

© 2026 Mohamed Tarek Abdelhady — Designed & Developed by Mohamed Tarek Abdelhady
