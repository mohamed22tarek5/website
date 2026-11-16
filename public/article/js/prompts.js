/* Prompts aggregator (#/prompts): every prompt inside every resource */
(function(){
'use strict';
var state = {q:'', sort:'copies'};
function allPrompts(){
  var out = [];
  ResourcesPage.published().forEach(function(r){
    (r.prompts || []).forEach(function(p){ out.push({res:r, p:p}); });
  });
  return out;
}
function render(){
  Router.setMeta(I18n.lang() === 'ar' ? 'البرومبتات' : 'Prompts', '');
  document.getElementById('app').innerHTML =
    '<div class="container page"><div class="section-header"><h1 class="section-title">' + (I18n.lang()==='ar'?'البرومبتات':'Prompts') + '</h1>' +
    '<p class="section-subtitle">' + (I18n.lang()==='ar'?'كل البرومبتات الجاهزة للنسخ من جميع المصادر.':'All copy-ready prompts from every resource.') + '</p></div>' +
    '<div class="toolbar"><input type="search" id="pr-q" placeholder="' + UI.esc(I18n.t('search_ph')) + '" aria-label="Search prompts">' +
    '<select id="pr-sort"><option value="copies">' + UI.esc(I18n.t('sort_copies')) + '</option><option value="newest">' + UI.esc(I18n.t('sort_newest')) + '</option><option value="az">A-Z</option></select></div>' +
    '<p class="form-hint" id="pr-count" style="margin-bottom:12px"></p><div id="pr-list" style="max-width:860px;margin:0 auto"></div></div>';
  paint();
  document.getElementById('pr-q').addEventListener('input', Search.debounce(function(e){ state.q = e.target.value; paint(); }, 280));
  document.getElementById('pr-sort').addEventListener('change', function(e){ state.sort = e.target.value; paint(); });
}
function paint(){
  var list = allPrompts();
  if(state.q){
    var q = state.q.toLowerCase();
    list = list.filter(function(x){ return ((x.p.title || '') + ' ' + (x.p.description || '') + ' ' + x.p.content + ' ' + ((x.p.tags||[]).join(' '))).toLowerCase().indexOf(q) >= 0; });
  }
  list = list.slice();
  if(state.sort === 'copies') list.sort(function(a,b){ return (b.res.copies||0)-(a.res.copies||0); });
  if(state.sort === 'newest') list.sort(function(a,b){ return String(b.res.date||'').localeCompare(String(a.res.date||'')); });
  if(state.sort === 'az') list.sort(function(a,b){ return String(a.p.title||'').localeCompare(String(b.p.title||'')); });
  var box = document.getElementById('pr-list'); if(!box) return;
  document.getElementById('pr-count').textContent = list.length;
  box.innerHTML = list.length ? list.map(function(x){
    return '<div style="margin-bottom:18px"><p class="form-hint" style="margin-bottom:6px"><a href="#/resource/' + UI.esc(x.res.slug) + '">← ' + UI.esc(UI.titleOf(x.res)) + '</a></p>' + UI.promptBlock(x.res.slug, x.p) + '</div>';
  }).join('') : UI.emptyState('⌨️', I18n.t('no_results'), I18n.t('try_other'));
}
window.PromptsPage = {render:render};
})();
