/* Search across resources: title, description, tags, category, platform, type. Debounced. */
(function(){
'use strict';
function norm(s){ return String(s == null ? '' : s).toLowerCase(); }
function searchResources(q){
  q = String(q || '').trim().toLowerCase();
  var all = Storage.getResources().filter(function(r){ return r.published !== false; });
  if(!q) return all;
  return all.filter(function(r){
    var hay = [r.title, r.title_en, r.description, r.description_en, r.category, r.platform, r.type, r.author,
      (r.tags || []).join(' '), ((r.prompts || []).map(function(p){ return p.title + ' ' + p.content; }).join(' '))].map(norm).join(' ');
    return hay.indexOf(q) >= 0;
  });
}
function debounce(fn, ms){ var t; return function(){ var a = arguments, c = this; clearTimeout(t); t = setTimeout(function(){ fn.apply(c, a); }, ms || 280); }; }
window.Search = {searchResources:searchResources, debounce:debounce};
})();
