/* Tools view (#/tools) + Downloads view (#/downloads): filtered resource lists */
(function(){
'use strict';
function byType(type, title, sub){
  Router.setMeta(title, sub);
  var list = ResourcesPage.published().filter(function(r){ return r.type === type; });
  document.getElementById('app').innerHTML =
    '<div class="container page"><div class="section-header"><h1 class="section-title">' + UI.esc(title) + '</h1>' +
    '<p class="section-subtitle">' + UI.esc(sub) + '</p></div>' +
    '<div class="toolbar"><input type="search" id="t-q" placeholder="' + UI.esc(I18n.t('search_ph')) + '" aria-label="Search"></div>' +
    '<div id="t-grid"></div></div>';
  function paint(q){
    var l = list.filter(function(r){
      if(!q) return true;
      return ((r.title||'') + ' ' + (r.title_en||'') + ' ' + (r.description||'') + ' ' + ((r.tags||[]).join(' '))).toLowerCase().indexOf(q.toLowerCase()) >= 0;
    });
    document.getElementById('t-grid').innerHTML = l.length
      ? '<div class="grid grid-3">' + l.map(function(r){ return UI.resourceCard(r); }).join('') + '</div>'
      : UI.emptyState('🧰', I18n.t('no_results'), I18n.t('try_other'));
  }
  paint('');
  document.getElementById('t-q').addEventListener('input', Search.debounce(function(e){ paint(e.target.value); }, 280));
}
function renderDownloads(){
  var title = I18n.lang() === 'ar' ? 'التنزيلات' : 'Downloads';
  Router.setMeta(title, '');
  var withFiles = ResourcesPage.published().filter(function(r){ return (r.files || []).length; });
  document.getElementById('app').innerHTML =
    '<div class="container page"><div class="section-header"><h1 class="section-title">' + UI.esc(title) + '</h1>' +
    '<p class="section-subtitle">' + (I18n.lang()==='ar'?'كل الملفات الحقيقية الجاهزة للتحميل المباشر.':'All real files ready for direct download.') + '</p></div>' +
    '<div id="dl-list" style="max-width:860px;margin:0 auto"></div></div>';
  document.getElementById('dl-list').innerHTML = withFiles.length ? withFiles.map(function(r){
    return '<h3 style="margin:20px 0 6px"><a href="#/resource/' + UI.esc(r.slug) + '">' + UI.esc(UI.titleOf(r)) + '</a></h3>' +
      r.files.map(function(f){
        return '<div class="file-row"><div class="file-icon">' + UI.esc((f.type||'FILE').slice(0,4).toUpperCase()) + '</div>' +
          '<div style="flex:1;min-width:180px"><strong>' + UI.esc(f.name) + '</strong><br><span class="form-hint">' + UI.esc(f.type||'') + ' · ' + UI.esc(f.size||'') + '</span></div>' +
          '<button class="btn btn-primary btn-sm" data-download-file="' + UI.esc(r.slug) + '|' + UI.esc(f.path) + '">⬇ ' + UI.esc(I18n.t('download')) + '</button></div>';
      }).join('');
  }).join('') : UI.emptyState('📦', I18n.t('no_results'), '');
}
window.ToolsPage = {
  renderTools:function(){ byType('TOOL', I18n.lang()==='ar'?'الأدوات':'Tools', I18n.lang()==='ar'?'أدوات مختارة بعناية مع روابطها الرسمية.':'Hand-picked tools with official links.'); },
  renderDownloads:renderDownloads
};
})();
