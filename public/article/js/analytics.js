/* Local-only analytics. No backend. Charts rendered with CSS bars. */
(function(){
'use strict';
function get(){ return Storage.getAnalytics(); }
function save(a){ Storage.saveAnalytics(a); }
function bump(map, id){ map[id] = (map[id] || 0) + 1; }
window.Analytics = {
  visit:function(){ var a = get(); a.visits = (a.visits || 0) + 1; save(a); },
  trackView:function(slug){ var a = get(); a.views = a.views || {}; bump(a.views, slug); save(a);
    var r = Storage.getResource(slug); if(r) Storage.updateResource(slug, {views:(r.views || 0) + 1}); },
  trackCopy:function(slug){ var a = get(); a.copies = a.copies || {}; bump(a.copies, slug); save(a);
    var r = Storage.getResource(slug); if(r) Storage.updateResource(slug, {copies:(r.copies || 0) + 1}); },
  trackDownload:function(slug){ var a = get(); a.downloads = a.downloads || {}; bump(a.downloads, slug); save(a);
    var r = Storage.getResource(slug); if(r) Storage.updateResource(slug, {downloads:(r.downloads || 0) + 1}); },
  totals:function(){
    var a = get();
    function sum(o){ var s = 0; Object.keys(o || {}).forEach(function(k){ s += (Number(o[k]) || 0); }); return s; }
    return {visits:Number(a.visits) || 0, views:sum(a.views), copies:sum(a.copies), downloads:sum(a.downloads)};
  },
  top:function(map, n){ return Object.keys(map || {}).map(function(k){ return {id:k, v:Number(map[k]) || 0}; }).sort(function(a,b){ return b.v - a.v; }).slice(0, n || 5); },
  barChart:function(rows, labelFn){
    if(!rows.length) return '<p class="form-hint">لا توجد بيانات بعد.</p>';
    var max = Number(rows[0].v) || 1;
    return rows.map(function(r){
      var val = Number(r.v) || 0;
      var pct = Math.min(100, Math.max(0, Math.round((val / max) * 100)));
      return '<div style="margin-bottom:10px"><div class="stat-row"><span>' + labelFn(r) + '</span><strong>' + val + '</strong></div><div class="chart-bar"><span style="width:' + pct + '%"></span></div></div>';
    }).join('');
  }
};
})();
