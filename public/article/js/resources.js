/* Articles (#/articles) + Resources hub (#/resources) + Category (#/category/id) + detail */
(function(){
'use strict';
var ARTICLE_TYPES = ['GUIDE','TUTORIAL','WORKFLOW','SYSTEM'];
var artState = {q:'', cat:'', sort:'newest'};

function published(){ return Storage.getResources().filter(function(r){ return r.published !== false; }); }
function isArticle(r){ return ARTICLE_TYPES.indexOf(r.type) >= 0; }

function articleList(){
  var list = published().filter(isArticle);
  if(artState.cat) list = list.filter(function(r){ return r.category === artState.cat; });
  if(artState.q){
    var q = artState.q.toLowerCase();
    list = list.filter(function(r){
      var hay = [r.title, r.title_en, r.description, r.description_en, r.category, r.platform, r.type, (r.tags||[]).join(' ')].join(' ').toLowerCase();
      return hay.indexOf(q) >= 0;
    });
  }
  list = list.slice();
  if(artState.sort === 'newest') list.sort(function(a,b){ return String(b.date||'').localeCompare(String(a.date||'')); });
  if(artState.sort === 'views') list.sort(function(a,b){ return (b.views||0)-(a.views||0); });
  if(artState.sort === 'copies') list.sort(function(a,b){ return (b.copies||0)-(a.copies||0); });
  if(artState.sort === 'az') list.sort(function(a,b){ return String(a.title||'').localeCompare(String(b.title||'')); });
  return list;
}

function renderArticles(){
  Router.setMeta(I18n.t('articles_title'), I18n.t('articles_sub'));
  var cats = Storage.getCategories().filter(function(c){
    return published().some(function(r){ return isArticle(r) && r.category === c.id; });
  });
  document.getElementById('app').innerHTML =
    '<div class="container page"><div class="section-header"><h1 class="section-title">' + UI.esc(I18n.t('articles_title')) + '</h1>' +
    '<p class="section-subtitle">' + UI.esc(I18n.t('articles_sub')) + '</p></div>' +
    '<div class="toolbar"><input type="search" id="art-q" placeholder="' + UI.esc(I18n.t('search_ph')) + '" value="' + UI.esc(artState.q) + '" aria-label="Search articles">' +
    '<select id="art-sort" aria-label="Sort"><option value="newest"' + (artState.sort==='newest'?' selected':'') + '>' + UI.esc(I18n.t('sort_newest')) + '</option>' +
    '<option value="views"' + (artState.sort==='views'?' selected':'') + '>' + UI.esc(I18n.t('sort_views')) + '</option>' +
    '<option value="copies"' + (artState.sort==='copies'?' selected':'') + '>' + UI.esc(I18n.t('sort_copies')) + '</option>' +
    '<option value="az"' + (artState.sort==='az'?' selected':'') + '>A-Z</option></select></div>' +
    (cats.length ? '<div class="chips">' + '<button class="chip' + (!artState.cat?' active':'') + '" data-acat="">' + UI.esc(I18n.t('f_all')) + '</button>' +
    cats.map(function(c){
      var n = I18n.lang() === 'ar' ? c.name : (c.name_en || c.name);
      var count = published().filter(function(r){ return isArticle(r) && r.category === c.id; }).length;
      return '<button class="chip' + (artState.cat===c.id?' active':'') + '" data-acat="' + UI.esc(c.id) + '">' + UI.esc(c.icon||'') + ' ' + UI.esc(n) + ' (' + count + ')</button>';
    }).join('') + '</div>' : '') +
    '<p class="form-hint" id="art-count" style="margin:10px 0 12px"></p><div id="art-grid"></div></div>';
  function paint(){
    var list = articleList(), g = document.getElementById('art-grid'); if(!g) return;
    document.getElementById('art-count').textContent = list.length;
    g.innerHTML = list.length
      ? '<div class="grid grid-3">' + list.map(function(r){ return UI.resourceCard(r, function(s){ return UI.hl(s, artState.q); }); }).join('') + '</div>'
      : UI.emptyState('📝', I18n.t('no_results'), I18n.t('try_other'));
  }
  paint();
  document.getElementById('art-q').addEventListener('input', Search.debounce(function(e){ artState.q = e.target.value; paint(); }, 280));
  document.getElementById('art-sort').addEventListener('change', function(e){ artState.sort = e.target.value; paint(); });
  document.querySelectorAll('[data-acat]').forEach(function(ch){
    ch.addEventListener('click', function(){
      artState.cat = ch.getAttribute('data-acat');
      document.querySelectorAll('[data-acat]').forEach(function(x){ x.classList.toggle('active', x === ch); });
      paint();
    });
  });
}

function renderCategory(id){
  var c = (Storage.getCategories() || []).find(function(x){ return x.id === id; });
  var name = c ? (I18n.lang() === 'ar' ? c.name : (c.name_en || c.name)) : id;
  Router.setMeta(name, '');
  var list = published().filter(function(r){ return r.category === id; });
  var arts = list.filter(isArticle), rest = list.filter(function(r){ return !isArticle(r); });
  var html = '<div class="container page"><div class="section-header"><h1 class="section-title">' + UI.esc((c && c.icon ? c.icon + ' ' : '') + name) + '</h1>' +
    '<p class="section-subtitle">' + list.length + ' / ' + published().length + '</p></div>';
  if(!list.length) html += UI.emptyState('🗂', I18n.t('no_results'), '', '<a class="btn btn-primary" href="#/articles">' + UI.esc(I18n.t('articles_title')) + '</a>');
  if(arts.length) html += '<h3 style="margin-bottom:12px">📖 ' + UI.esc(I18n.t('articles_title')) + ' (' + arts.length + ')</h3><div class="grid grid-3" style="margin-bottom:28px">' + arts.map(function(r){ return UI.resourceCard(r); }).join('') + '</div>';
  if(rest.length) html += '<h3 style="margin-bottom:12px">🧰 (' + rest.length + ')</h3><div class="grid grid-3">' + rest.map(function(r){ return UI.resourceCard(r); }).join('') + '</div>';
  document.getElementById('app').innerHTML = html + '</div>';
}

function renderHub(){
  Router.setMeta(I18n.t('resources_title'), I18n.t('resources_sub'));
  var dls = published().filter(function(r){ return r.type === 'DOWNLOAD'; });
  var withFiles = published().filter(function(r){ return (r.files || []).length; });
  var links = published().filter(function(r){ return r.website && UI.safeUrl(r.website); }).slice(0, 8);
  var html = '<div class="container page"><div class="section-header"><h1 class="section-title">' + UI.esc(I18n.t('resources_title')) + '</h1>' +
    '<p class="section-subtitle">' + UI.esc(I18n.t('resources_sub')) + '</p></div>';
  html += '<h3 style="margin-bottom:12px">📦 ' + UI.esc(I18n.t('files_sec')) + '</h3><div style="max-width:880px;margin-bottom:30px">' +
    (withFiles.length ? withFiles.map(function(r){
      return '<h4 style="margin:16px 0 6px"><a href="#/resource/' + UI.esc(r.slug) + '">' + UI.esc(UI.titleOf(r)) + '</a></h4>' + r.files.map(function(f){
        return '<div class="file-row"><div class="file-icon">' + UI.esc((f.type||'F').slice(0,4).toUpperCase()) + '</div>' +
          '<div style="flex:1;min-width:180px"><strong>' + UI.esc(f.name) + '</strong><br><span class="form-hint">' + UI.esc(f.type||'') + ' · ' + UI.esc(f.size||'') + '</span></div>' +
          '<button class="btn btn-primary btn-sm" data-download-file="' + UI.esc(r.slug) + '|' + UI.esc(f.path) + '">⬇ ' + UI.esc(I18n.t('download')) + '</button></div>';
      }).join('');
    }).join('') : UI.emptyState('📦', I18n.t('no_results'), '')) + '</div>';
  if(dls.length) html += '<h3 style="margin-bottom:12px">📖 ' + UI.esc(I18n.t('guides_sec')) + '</h3><div class="grid grid-3" style="margin-bottom:30px">' + dls.map(function(r){ return UI.resourceCard(r); }).join('') + '</div>';
  if(links.length) html += '<h3 style="margin-bottom:12px">🔗 ' + UI.esc(I18n.t('links_sec')) + '</h3><div class="grid grid-3">' + links.map(function(r){
    return '<a class="res-card reveal revealed" href="' + UI.esc(r.website) + '" target="_blank" rel="noopener noreferrer"><div class="res-body">' +
      '<span class="type-badge">↗ ' + UI.esc(r.platform || 'Web') + '</span><h3 class="res-title">' + UI.esc(UI.titleOf(r)) + '</h3>' +
      '<p class="res-desc">' + UI.esc(UI.descOf(r)) + '</p></div></a>';
  }).join('') + '</div>';
  document.getElementById('app').innerHTML = html + '</div>';
}

/* ---------- Detail ---------- */
function renderDetail(slug){
  var r = Storage.getResource(slug);
  if(!r || r.published === false){
    document.getElementById('app').innerHTML = '<div class="container page">' + UI.emptyState('🔍', I18n.t('no_results'), '', '<a class="btn btn-primary" href="#/resources">' + UI.esc(I18n.t('view_all')) + '</a>') + '</div>';
    return;
  }
  Analytics.trackView(slug);
  r = Storage.getResource(slug);
  Router.setMeta(UI.titleOf(r), UI.descOf(r), r);
  var toc = [];
  (r.blocks || []).forEach(function(b, i){ if(b.t === 'h') toc.push({i:i, text:b.text}); });
  var saved = Storage.isSavedResource(slug);
  var html = '<div class="container page"><div class="detail-hero">' +
    '<div class="res-badges" style="justify-content:center;display:flex;gap:6px;flex-wrap:wrap"><span class="type-badge type-' + UI.esc(r.type) + '">' + UI.esc(I18n.typeIcon(r.type)) + ' ' + UI.esc(I18n.t('type_' + r.type)) + '</span>' +
    (r.platform ? '<span class="plat-badge">' + UI.esc(r.platform) + '</span>' : '') +
    '<span class="plat-badge">' + UI.esc(UI.catName(r.category)) + '</span>' + (r.featured ? '<span class="feat-badge">★</span>' : '') + '</div>' +
    '<h1>' + UI.esc(UI.titleOf(r)) + '</h1><p class="detail-desc">' + UI.esc(UI.descOf(r)) + '</p>' +
    '<div class="detail-meta"><span>✍️ ' + UI.esc(r.author || '') + '</span><span>📅 ' + UI.esc(r.date || '') + '</span>' +
    '<span>⏱ ' + UI.esc(String(r.readingTime || 5)) + ' ' + UI.esc(I18n.t('min_read')) + '</span><span>👁 ' + (r.views || 0) + '</span></div>' +
    '<div class="res-tags" style="justify-content:center;display:flex;flex-wrap:wrap;gap:6px">' + ((r.tags||[]).map(function(t){ return '<span class="tag">' + UI.esc(t) + '</span>'; }).join('')) + '</div></div>' +
    (r.cover ? '<img src="' + UI.esc(r.cover) + '" alt="" loading="lazy" style="border-radius:14px;margin:22px auto;max-width:820px">' : '') +
    '<div class="detail-layout"><aside class="toc"><h4>' + UI.esc(I18n.t('toc')) + '</h4>' +
    (toc.length ? toc.map(function(t, k){ return '<a href="#sec-' + k + '">' + UI.esc(String(t.text).slice(0, 60)) + '</a>'; }).join('') : '<span class="form-hint">—</span>') +
    '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-secondary btn-sm" id="share-btn">' + UI.esc(I18n.t('share')) + '</button>' +
    '<button class="save-btn' + (saved ? ' active' : '') + '" data-save-res="' + UI.esc(slug) + '" aria-pressed="' + saved + '">♥</button></div></aside>' +
    '<article class="article-content">' + blocksWithAnchors(r) +
    ((r.prompts || []).length > 1 ? '<button class="btn btn-secondary btn-sm" id="copy-all" style="margin-top:8px">⧉ ' + UI.esc(I18n.t('copy_all')) + ' (' + r.prompts.length + ')</button>' : '') +
    filesHtml(r) + '</article></div>' +
    relatedHtml(r) + '</div>';
  document.getElementById('app').innerHTML = html;
  Router.articleSchema(r);
  document.getElementById('share-btn').onclick = function(){
    if(navigator.share){ navigator.share({title:UI.titleOf(r), url:location.href}).catch(function(){}); }
    else UI.copyText(location.href, null);
  };
  var ca = document.getElementById('copy-all');
  if(ca) ca.onclick = function(){
    var all = (r.prompts || []).map(function(p, i){ return '=== ' + (i+1) + '. ' + p.title + ' ===\n' + p.content; }).join('\n\n');
    Analytics.trackCopy(slug); UI.copyText(all, ca);
  };
}
function blocksWithAnchors(r){
  var k = -1;
  var byPrompt = {}; (r.prompts || []).forEach(function(p){ byPrompt[p.id] = p; });
  return (r.blocks || []).map(function(b){
    if(b.t === 'h'){ k++; return '<h2 id="sec-' + k + '">' + UI.esc(b.text) + '</h2>'; }
    if(b.t === 'prompt' && byPrompt[b.promptId]) return UI.promptBlock(r.slug, byPrompt[b.promptId]);
    return UI.renderBlocks([b], r.slug);
  }).join('');
}
function filesHtml(r){
  if(!(r.files || []).length) return '';
  return '<h2>' + UI.esc(I18n.t('files_in')) + '</h2>' + r.files.map(function(f){
    return '<div class="file-row"><div class="file-icon">' + UI.esc((f.type || 'FILE').slice(0,4).toUpperCase()) + '</div>' +
      '<div style="flex:1;min-width:180px"><strong>' + UI.esc(f.name) + '</strong><br><span class="form-hint">' + UI.esc(f.type || '') + ' · ' + UI.esc(f.size || '') + '</span></div>' +
      '<button class="btn btn-primary btn-sm" data-download-file="' + UI.esc(r.slug) + '|' + UI.esc(f.path) + '">⬇ ' + UI.esc(I18n.t('download')) + '</button></div>';
  }).join('');
}
function relatedHtml(r){
  var rel = published().filter(function(x){
    return x.slug !== r.slug && (x.category === r.category || x.platform === r.platform);
  }).slice(0, 3);
  if(!rel.length) return '';
  return '<div style="max-width:1040px;margin:36px auto 0"><h3>' + UI.esc(I18n.t('related')) + '</h3>' +
    '<div class="grid grid-3" style="margin-top:14px">' + rel.map(function(x){ return UI.resourceCard(x); }).join('') + '</div></div>';
}
/* Copy helpers used by global delegation */
function copyFirst(slug, btn){
  var r = Storage.getResource(slug); if(!r || !(r.prompts||[]).length) return;
  Analytics.trackCopy(slug); UI.copyText(r.prompts[0].content, btn);
}
function copyPrompt(key, btn){
  var parts = key.split(':'), r = Storage.getResource(parts[0]);
  if(!r) return;
  var p = (r.prompts || []).find(function(x){ return x.id === parts[1]; });
  if(!p) return;
  Analytics.trackCopy(r.slug); UI.copyText(p.content, btn);
}
function downloadFile(slug, path, name){
  Analytics.trackDownload(slug);
  var fullPath = path || '';
  if(!fullPath.startsWith('/') && !fullPath.startsWith('http')){
    fullPath = '/article/' + fullPath;
  }
  var a = document.createElement('a'); a.href = fullPath; a.setAttribute('download', name || ''); document.body.appendChild(a); a.click(); a.remove();
  UI.toast(I18n.t('dl_started'), 'success');
}
window.ResourcesPage = {renderArticles:renderArticles, renderHub:renderHub, renderCategory:renderCategory, renderDetail:renderDetail, copyFirst:copyFirst, copyPrompt:copyPrompt, downloadFile:downloadFile, published:published, isArticle:isArticle};
})();
