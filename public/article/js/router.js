/* Hash router — static only. #/articles #/resource/slug #/prompts #/tools #/resources #/category/id #/about #/downloads #/saved #/admin */
(function(){
'use strict';
function parseHash(){
  var h = window.location.hash || '#/home';
  h = h.replace(/^#/, '');
  var parts = h.split('?'), path = parts[0], query = {};
  if(parts[1]) parts[1].split('&').forEach(function(p){ var kv = p.split('='); query[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ''); });
  return {path:path, segs:path.split('/').filter(Boolean), query:query};
}
function setMeta(title, desc, resource){
  var site = (Storage.getSettings() || {}).siteNameAr || 'M.T.A. Lab';
  document.title = title + ' — ' + site;
  var m = document.querySelector('meta[name="description"]'); if(m && desc) m.setAttribute('content', String(desc).slice(0, 160));
  var old = document.getElementById('ld-article'); if(old) old.remove();
  if(resource){
    var ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'ld-article';
    ld.textContent = JSON.stringify({'@context':'https://schema.org','@type':'Article',headline:resource.title, description:resource.description,
      author:{'@type':'Organization', name:resource.author || site}, datePublished:resource.date, inLanguage: I18n.lang() === 'ar' ? 'ar' : 'en'});
    document.head.appendChild(ld);
  }
}
function render(){
  var app = document.getElementById('app');
  var r = parseHash(), seg = r.segs, P = window.Pages || {};
  document.querySelectorAll('.nav-link').forEach(function(a){
    var href = a.getAttribute('href') || '';
    var key = seg[0] || 'home';
    if(key === 'resource' || key === 'category') key = key === 'category' ? 'articles' : 'resources';
    a.classList.toggle('active', href === '#/' + key);
  });
  try{
    if(!seg.length || seg[0] === 'home') P.home();
    else if(seg[0] === 'articles') P.articles();
    else if(seg[0] === 'about') P.about();
    else if(seg[0] === 'category' && seg[1]) P.category(decodeURIComponent(seg[1]));
    else if(seg[0] === 'resources') P.resources();
    else if(seg[0] === 'resource' && seg[1]) P.resourceDetail(decodeURIComponent(seg[1]));
    else if(seg[0] === 'prompts') P.prompts();
    else if(seg[0] === 'tools') P.tools();
    else if(seg[0] === 'downloads') P.downloads();
    else if(seg[0] === 'saved') P.saved();
    else if(seg[0] === 'search') P.searchRes(r.query.q || '');
    else if(seg[0] === 'admin') window.Admin.render(seg.slice(1));
    else notFound();
  }catch(e){ console.error(e); app.innerHTML = '<div class="container page"><h1>حدث خطأ</h1><p>' + UI.esc(e.message) + '</p></div>'; }
  window.scrollTo({top:0, behavior:'smooth'});
  reveal();
  Analytics.visit();
}
function notFound(){
  setMeta('404', '');
  document.getElementById('app').innerHTML = '<div class="container page">' + UI.emptyState('🔍', 'الصفحة غير موجودة', '', '<a class="btn btn-primary" href="#/home">الرئيسية</a>') + '</div>';
}
function reveal(){
  var els = document.querySelectorAll('.reveal:not(.revealed)');
  if(!('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('revealed'); }); return; }
  var ob = new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('revealed'); ob.unobserve(en.target); } }); }, {threshold:.06});
  els.forEach(function(e){ ob.observe(e); });
}
window.Router = {render:render, parseHash:parseHash, setMeta:setMeta, articleSchema:function(){}};
window.addEventListener('hashchange', render);
})();
