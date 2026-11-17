/* Home + Saved + Search pages, global wiring */
(function(){
'use strict';
function pub(){ return Storage.getResources().filter(function(r){ return r.published !== false; }); }

var DEV = {name:'Mohamed Tarek Abdelhady', nameAr:'محمد طارق عبدالهادي',
  roles:['Communication Engineer','Electronics Engineer','Web Developer','PCB Designer','Embedded Systems & IoT'],
  linkedin:'https://www.linkedin.com/in/mohamedtarek225', github:'https://github.com/mohamed22tarek5',
  instagram:'https://www.instagram.com/_m7md_tarek_/', email:'mailto:mohammed.tarek.abdelhady.ali@gmail.com',
  portfolio:'https://mohamed-tarek-abdelhady.vercel.app'};

function home(){
  var s = Storage.getSettings();
  Router.setMeta('M.T.A. Lab', s.tagline);
  function arts(){ return pub().filter(function(r){ return ResourcesPage.isArticle(r); }); }
  var feat = pub().filter(function(r){ return r.featured; }).slice(0, 3);
  var latestArt = arts().sort(function(a,b){ return String(b.date||'').localeCompare(String(a.date||'')); }).slice(0, 3);
  var withPrompts = pub().filter(function(r){ return (r.prompts||[]).length; }).sort(function(a,b){ return (b.copies||0)-(a.copies||0); }).slice(0, 2);
  var popPrompts = [];
  withPrompts.forEach(function(r){ (r.prompts||[]).slice(0,2).forEach(function(p){ popPrompts.push({res:r, p:p}); }); });
  popPrompts = popPrompts.slice(0, 3);
  var tools = pub().filter(function(r){ return r.type === 'TOOL'; }).slice(0, 3);
  var dls = pub().filter(function(r){ return r.type === 'DOWNLOAD'; }).slice(0, 3);
  var cats = Storage.getCategories().slice(0, 8);
  var totals = {a:arts().length,
    p:pub().reduce(function(n,r){ return n + (r.prompts||[]).length; }, 0),
    t:pub().filter(function(r){ return r.type === 'TOOL'; }).length};
  var ar = I18n.lang() === 'ar';

  document.getElementById('app').innerHTML =
  '<section class="hero"><div class="hero-bg"><div class="orb"></div><div class="orb"></div><div class="hero-grid-bg"></div></div>' +
  '<div class="container"><div class="hero-inner">' +
  '<div class="hero-badge"><span class="dot"></span>M.T.A. Lab · ' + UI.esc(I18n.t('brand_sub')) + '</div>' +
  '<h1 class="hero-title">M.T.A. Lab</h1>' +
  '<p class="hero-tag">Articles • AI Tools • Prompts • Knowledge Hub</p>' +
  '<p class="hero-tag-ar" dir="rtl" lang="ar">مقالات تقنية • أدوات الذكاء الاصطناعي • برومبتات • المعرفة</p>' +
  '<p class="hero-sub">' + UI.esc(I18n.t('hero_desc')) + '</p>' +
  '<form class="hero-search" id="hero-search"><input type="search" id="hero-q" data-i18n-ph="search_ph" placeholder="' + UI.esc(I18n.t('search_ph')) + '" aria-label="Search"><button class="btn btn-primary" type="submit" data-i18n="search">' + UI.esc(I18n.t('search')) + '</button></form>' +
  '<div class="hero-actions"><a class="btn btn-primary" href="#/articles">' + UI.esc(I18n.t('explore_articles')) + '</a><a class="btn btn-secondary" href="#/prompts">' + UI.esc(I18n.t('browse_prompts_btn')) + '</a></div>' +
  '<div class="hero-stats"><span class="hero-stat"><strong>' + totals.a + '</strong> ' + (ar?'مقال':'articles') + '</span><span class="hero-stat"><strong>' + totals.p + '</strong> ' + (ar?'برومبت':'prompts') + '</span><span class="hero-stat"><strong>' + totals.t + '</strong> ' + (ar?'أداة':'tools') + '</span></div>' +
  '</div></div></section>' +
  (feat.length ? '<section class="section"><div class="container"><div class="section-head-row"><h2>' + UI.esc(I18n.t('sec_featured')) + '</h2><a class="btn btn-ghost btn-sm" href="#/articles" data-i18n="view_all">' + UI.esc(I18n.t('view_all')) + '</a></div><div class="grid grid-3">' + feat.map(function(r){ return UI.resourceCard(r); }).join('') + '</div></div></section>' : '') +
  (latestArt.length ? '<section class="section section-alt"><div class="container"><div class="section-head-row"><h2>' + UI.esc(I18n.t('sec_latest_art')) + '</h2><a class="btn btn-ghost btn-sm" href="#/articles" data-i18n="view_all">' + UI.esc(I18n.t('view_all')) + '</a></div><div class="grid grid-3">' + latestArt.map(function(r){ return UI.resourceCard(r); }).join('') + '</div></div></section>' : '') +
  (popPrompts.length ? '<section class="section"><div class="container" style="max-width:900px"><div class="section-head-row"><h2>' + UI.esc(I18n.t('popular_prompts')) + '</h2><a class="btn btn-ghost btn-sm" href="#/prompts" data-i18n="view_all">' + UI.esc(I18n.t('view_all')) + '</a></div>' + popPrompts.map(function(x){ return UI.promptBlock(x.res.slug, x.p); }).join('') + '</div></section>' : '') +
  (tools.length ? '<section class="section section-alt"><div class="container"><div class="section-head-row"><h2>' + (ar?'أدوات AI':'AI Tools') + '</h2><a class="btn btn-ghost btn-sm" href="#/tools" data-i18n="view_all">' + UI.esc(I18n.t('view_all')) + '</a></div><div class="grid grid-3">' + tools.map(function(r){ return UI.resourceCard(r); }).join('') + '</div></div></section>' : '') +
  (dls.length ? '<section class="section"><div class="container"><div class="section-head-row"><h2>' + UI.esc(I18n.t('resources_title')) + '</h2><a class="btn btn-ghost btn-sm" href="#/resources" data-i18n="view_all">' + UI.esc(I18n.t('view_all')) + '</a></div><div class="grid grid-3">' + dls.map(function(r){ return UI.resourceCard(r); }).join('') + '</div></div></section>' : '') +
  (!feat.length && !latestArt.length && !popPrompts.length && !tools.length && !dls.length ?
    '<section class="section"><div class="container">' +
    UI.emptyState('✨', (ar ? 'المختبر جاهز' : 'M.T.A. Lab is Ready'), (ar ? 'لا يوجد محتوى منشور حالياً. يمكنك إضافة مقالات وبرومبتات وأدوات جديدة من لوحة التحكم.' : 'No content published yet. You can add new articles, prompts, and tools from the admin panel.'), '<a class="btn btn-primary" href="#/admin">' + (ar ? 'لوحة التحكم' : 'Admin Panel') + '</a>') +
    '</div></section>' : '') +
  (cats.length ? '<section class="section section-alt"><div class="container"><div class="section-header"><span class="section-label">Browse</span><h2 class="section-title" data-i18n="categories">' + UI.esc(I18n.t('categories')) + '</h2></div><div class="grid grid-4">' +
  cats.map(function(c){
    var n = pub().filter(function(r){ return r.category === c.id; }).length;
    var nm = I18n.lang() === 'ar' ? c.name : (c.name_en || c.name);
    return '<a class="cat-card reveal revealed" href="#/category/' + UI.esc(c.id) + '"><div class="cat-icon">' + UI.esc(c.icon||'📁') + '</div><div class="cat-name">' + UI.esc(nm) + '</div><div class="cat-count">' + n + '</div></a>';
  }).join('') + '</div></div></section>' : '');
  document.getElementById('hero-search').addEventListener('submit', function(e){
    e.preventDefault();
    location.hash = '#/search?q=' + encodeURIComponent(document.getElementById('hero-q').value.trim());
  });
}

function about(){
  var ar = I18n.lang() === 'ar';
  Router.setMeta(I18n.t('about_title'), I18n.t('about_desc'));
  var built = ['HTML5','CSS3','JavaScript','LocalStorage','Responsive Design','SEO','Accessibility','RTL / LTR'];
  document.getElementById('app').innerHTML = '<div class="container page"><div class="about-hero">' +
    '<div class="about-avatar">MT</div>' +
    '<span class="section-label">M.T.A. Lab</span>' +
    '<h1>' + UI.esc(I18n.t('about_title')) + '</h1>' +
    '<h2 class="about-name">' + DEV.name + '</h2>' +
    '<div class="role-chips">' + DEV.roles.map(function(r){ return '<span class="tag tag-accent">' + UI.esc(r) + '</span>'; }).join('') + '</div>' +
    '<p class="about-desc">' + UI.esc(I18n.t('about_desc')) + '</p>' +
    '<div class="social-row">' +
    '<a class="btn btn-secondary btn-sm" href="' + DEV.linkedin + '" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>' +
    '<a class="btn btn-secondary btn-sm" href="' + DEV.github + '" target="_blank" rel="noopener noreferrer">GitHub ↗</a>' +
    '<a class="btn btn-secondary btn-sm" href="' + DEV.instagram + '" target="_blank" rel="noopener noreferrer">Instagram ↗</a>' +
    '<a class="btn btn-secondary btn-sm" href="' + DEV.email + '">Email</a>' +
    '<a class="btn btn-secondary btn-sm" href="' + DEV.portfolio + '" target="_blank" rel="noopener noreferrer">Portfolio ↗</a></div>' +
    '<div class="hero-actions" style="margin-top:18px"><a class="btn btn-primary" href="#/articles">' + UI.esc(I18n.t('about_cta')) + '</a></div></div>' +
    '<div class="about-built"><h3>🛠 ' + UI.esc(I18n.t('built_with')) + '</h3><div class="built-grid">' +
    built.map(function(b){ return '<span class="built-chip">' + UI.esc(b) + '</span>'; }).join('') + '</div>' +
    '<p class="form-hint" style="margin-top:12px">' + (ar ? 'كل شيء في هذه المنصة يعمل بملفات ثابتة فقط — ابحث، صفِّ، انسخ، حمّل، واحفظ.' : 'Everything on this platform runs on static files only — search, filter, copy, download and save.') + '</p></div></div>';
}

function saved(){
  Router.setMeta(I18n.t('saved_title'), '');
  var s = Storage.getSaved();
  var res = s.resources.map(function(slug){ return Storage.getResource(slug); }).filter(function(r){ return r && r.published !== false; });
  var prm = s.prompts.map(function(key){
    var parts = key.split(':'), r = Storage.getResource(parts[0]);
    if(!r) return null;
    var p = (r.prompts || []).find(function(x){ return x.id === parts[1]; });
    return p ? {res:r, p:p} : null;
  }).filter(Boolean);
  var html = '<div class="container page"><div class="section-header"><h1 class="section-title">' + UI.esc(I18n.t('saved_title')) + '</h1><p class="section-subtitle">' + UI.esc(I18n.t('saved_sub')) + '</p></div>';
  if(!res.length && !prm.length) html += UI.emptyState('♥', I18n.t('saved_title'), I18n.lang()==='ar'?'اضغط ♥ على أي مصدر أو برومبت لحفظه هنا.':'Press ♥ on any resource or prompt to save it here.', '<a class="btn btn-primary" href="#/resources">' + UI.esc(I18n.t('explore')) + '</a>');
  if(res.length) html += '<h3>📚 (' + res.length + ')</h3><div class="grid grid-3" style="margin:12px 0 28px">' + res.map(function(r){ return UI.resourceCard(r); }).join('') + '</div>';
  if(prm.length) html += '<h3>⌨️ (' + prm.length + ')</h3><div style="max-width:860px">' + prm.map(function(x){ return UI.promptBlock(x.res.slug, x.p); }).join('') + '</div>';
  document.getElementById('app').innerHTML = html + '</div>';
}

function searchRes(q){
  q = String(q || '');
  Router.setMeta((I18n.lang()==='ar'?'نتائج: ':'Results: ') + q, '');
  var list = Search.searchResources(q);
  var html = '<div class="container page"><h1>' + (I18n.lang()==='ar'?'نتائج البحث':'Search results') + ' «' + UI.esc(q) + '» (' + list.length + ')</h1>' +
    '<div class="toolbar"><input type="search" id="sr-q" value="' + UI.esc(q) + '" aria-label="Search"><button class="btn btn-primary btn-sm" id="sr-go">' + UI.esc(I18n.t('search')) + '</button></div>';
  if(!list.length) html += UI.emptyState('🔍', I18n.t('no_results'), I18n.t('try_other'));
  else html += '<div class="grid grid-3">' + list.map(function(r){ return UI.resourceCard(r, function(s){ return UI.hl(s, q); }); }).join('') + '</div>';
  document.getElementById('app').innerHTML = html + '</div>';
  function go(){ location.hash = '#/search?q=' + encodeURIComponent(document.getElementById('sr-q').value.trim()); }
  document.getElementById('sr-go').onclick = go;
  document.getElementById('sr-q').addEventListener('keydown', function(e){ if(e.key === 'Enter') go(); });
}

window.Pages = {
  home:home,
  articles:function(){ ResourcesPage.renderArticles(); },
  about:about,
  category:function(id){ ResourcesPage.renderCategory(id); },
  resources:function(){ ResourcesPage.renderHub(); },
  resourceDetail:function(s){ ResourcesPage.renderDetail(s); },
  prompts:function(){ PromptsPage.render(); },
  tools:function(){ ToolsPage.renderTools(); },
  downloads:function(){ ToolsPage.renderDownloads(); },
  saved:saved, searchRes:searchRes
};

/* ---------- init ---------- */
function initTheme(){
  var t = null; try{ t = localStorage.getItem('theme'); }catch(e){}
  if(!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t); updateThemeBtn();
}
function updateThemeBtn(){
  var b = document.getElementById('themeToggle'); if(!b) return;
  b.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☾' : '☀';
}
document.addEventListener('DOMContentLoaded', function(){
  Storage.init(); I18n.apply(); initTheme();
  document.getElementById('currentYear').textContent = new Date().getFullYear();
  var header = document.getElementById('header'), prog = document.getElementById('scrollProgress'), top = document.getElementById('backToTop'), tick = false;
  window.addEventListener('scroll', function(){
    if(tick) return; tick = true;
    requestAnimationFrame(function(){
      var y = window.scrollY;
      header.classList.toggle('scrolled', y > 40);
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      top.classList.toggle('visible', y > 500); tick = false;
    });
  }, {passive:true});
  top.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });
  var tg = document.getElementById('menuToggle'), nav = document.getElementById('navMenu'), ov = document.getElementById('mobileOverlay');
  function toggle(force){
    var open = force !== undefined ? force : !nav.classList.contains('active');
    nav.classList.toggle('active', open); tg.classList.toggle('active', open);
    tg.setAttribute('aria-expanded', String(open)); ov.classList.toggle('active', open);
  }
  tg.addEventListener('click', function(){ toggle(); });
  ov.addEventListener('click', function(){ toggle(false); });
  nav.addEventListener('click', function(e){ if(e.target.closest('a')) toggle(false); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && nav.classList.contains('active')) toggle(false); });
  document.getElementById('themeToggle').addEventListener('click', function(){
    var n = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', n);
    try{ localStorage.setItem('theme', n); }catch(e){} updateThemeBtn();
  });
  document.getElementById('langToggle').addEventListener('click', function(){ I18n.setLang(I18n.lang() === 'ar' ? 'en' : 'ar'); });
  document.getElementById('navSearch').addEventListener('click', function(){ location.hash = '#/search?q='; });
  /* Global delegation: save / copy / download */
  document.addEventListener('click', function(e){
    var sr = e.target.closest('[data-save-res]');
    if(sr){ var on = Storage.toggleSavedResource(sr.getAttribute('data-save-res'));
      sr.classList.toggle('active', on); sr.setAttribute('aria-pressed', String(on));
      UI.toast(on ? I18n.t('saved_add') : I18n.t('saved_remove'), 'success'); return; }
    var sp = e.target.closest('[data-save-prompt]');
    if(sp){ var onp = Storage.toggleSavedPrompt(sp.getAttribute('data-save-prompt'));
      sp.classList.toggle('active', onp); sp.setAttribute('aria-pressed', String(onp));
      UI.toast(onp ? I18n.t('saved_add') : I18n.t('saved_remove'), 'success'); return; }
    var cf = e.target.closest('[data-copy-first]');
    if(cf){ ResourcesPage.copyFirst(cf.getAttribute('data-copy-first'), cf); return; }
    var cp = e.target.closest('[data-copy-prompt]');
    if(cp){ ResourcesPage.copyPrompt(cp.getAttribute('data-copy-prompt'), cp); return; }
    var dl = e.target.closest('[data-download-file]');
    if(dl){ var parts = dl.getAttribute('data-download-file').split('|');
      var r = Storage.getResource(parts[0]);
      var f = r ? (r.files || []).find(function(x){ return x.path === parts[1]; }) : null;
      ResourcesPage.downloadFile(parts[0], parts[1], f ? f.name : ''); return; }
  });
  /* chips container on home categories link to filtered library — handled via library page */
  setTimeout(function(){ document.getElementById('loader').classList.add('hidden'); }, 350);
  if(!location.hash) location.hash = '#/home'; /* hashchange triggers render */
  else Router.render();
});
})();
