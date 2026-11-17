/* Centralized client-side database. All localStorage access lives here. */
(function(){
'use strict';
var K = {resources:'resources', categories:'categories', settings:'settings', analytics:'analytics', saved:'saved'};

function read(key, fb){
  try{ var raw = localStorage.getItem(key); if(raw === null) return fb; return JSON.parse(raw); }
  catch(e){ return fb; }
}
function write(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); return true; }
  catch(e){ if(window.UI) UI.toast('مساحة التخزين ممتلئة', 'error'); return false; }
}
function slugify(s){
  return String(s||'').trim().toLowerCase()
    .replace(/[\u064B-\u0652]/g,'')
    .replace(/[^a-z0-9\u0600-\u06FF]+/g,'-')
    .replace(/^-+|-+$/g,'').slice(0,80) || ('res-'+Date.now().toString(36));
}
function uid(p){ return (p||'id')+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7); }

var CURRENT_DB_VERSION = '2.1.0_clean_all';

function seed(){
  var storedVersion = localStorage.getItem('mta_lab_v');
  if (storedVersion !== CURRENT_DB_VERSION) {
    // Purge previous demo data and demo categories
    write(K.resources, window.DEMO_RESOURCES || []);
    write(K.categories, window.DEMO_CATEGORIES || []);
    write(K.analytics, {views:{}, copies:{}, downloads:{}, visits:0});
    write(K.saved, {resources:[], prompts:[]});
    localStorage.setItem('mta_lab_v', CURRENT_DB_VERSION);
  }

  if(!localStorage.getItem(K.resources)) write(K.resources, window.DEMO_RESOURCES || []);
  if(!localStorage.getItem(K.categories)) write(K.categories, window.DEMO_CATEGORIES || []);
  if(!localStorage.getItem(K.settings)) write(K.settings, window.DEMO_SETTINGS || {});
  if(!localStorage.getItem(K.analytics)) write(K.analytics, {views:{}, copies:{}, downloads:{}, visits:0});
  if(!localStorage.getItem(K.saved)) write(K.saved, {resources:[], prompts:[]});
}

window.Storage = {
  KEYS: K, uid: uid, slugify: slugify,
  init: function(){ seed(); },
  resetDemo: function(){
    write(K.resources, window.DEMO_RESOURCES || []);
    write(K.categories, window.DEMO_CATEGORIES || []);
    write(K.settings, window.DEMO_SETTINGS || {});
    write(K.analytics, {views:{}, copies:{}, downloads:{}, visits:0});
    write(K.saved, {resources:[], prompts:[]});
  },
  exportData: function(){
    return {app:'mta-lab', version:1, exportedAt:new Date().toISOString(),
      resources:this.getResources(), categories:this.getCategories(),
      settings:this.getSettings(), analytics:this.getAnalytics(), saved:this.getSaved()};
  },
  importData: function(d){
    if(!d || typeof d !== 'object') return {ok:false, error:'ملف البيانات غير صالح'};
    if(!Array.isArray(d.resources) || !Array.isArray(d.categories)) return {ok:false, error:'ملف البيانات غير صالح'};
    for(var i=0;i<d.resources.length;i++){
      var r = d.resources[i];
      if(!r || typeof r.slug !== 'string' || typeof r.title !== 'string' || typeof r.type !== 'string')
        return {ok:false, error:'ملف البيانات غير صالح'};
    }
    write(K.resources, d.resources); write(K.categories, d.categories);
    if(d.settings) write(K.settings, d.settings);
    return {ok:true};
  },
  getResources: function(){ var v = read(K.resources, []); return Array.isArray(v) ? v : []; },
  saveResources: function(a){ return write(K.resources, a); },
  getResource: function(slug){ return this.getResources().find(function(r){return r.slug === slug;}) || null; },
  addResource: function(r){
    var list = this.getResources();
    r.slug = r.slug && r.slug.trim() ? slugify(r.slug) : slugify(r.title);
    if(list.some(function(x){return x.slug === r.slug;})) r.slug += '-' + Date.now().toString(36).slice(-4);
    r.date = r.date || new Date().toISOString().slice(0,10);
    r.views = r.views || 0; r.copies = r.copies || 0; r.downloads = r.downloads || 0;
    r.prompts = r.prompts || []; r.blocks = r.blocks || []; r.files = r.files || []; r.tags = r.tags || [];
    list.unshift(r); write(K.resources, list); return r;
  },
  updateResource: function(slug, patch){
    var list = this.getResources(), ok = false;
    list = list.map(function(r){ if(r.slug === slug){ ok = true; return Object.assign({}, r, patch); } return r; });
    if(ok) write(K.resources, list); return ok;
  },
  deleteResource: function(slug){ write(K.resources, this.getResources().filter(function(r){return r.slug !== slug;})); },
  getCategories: function(){ var v = read(K.categories, []); return Array.isArray(v) ? v : []; },
  saveCategories: function(c){ return write(K.categories, c); },
  addCategory: function(c){ var l = this.getCategories(); c.id = c.id || slugify(c.name); l.push(c); write(K.categories, l); return c; },
  deleteCategory: function(id){ write(K.categories, this.getCategories().filter(function(c){return c.id !== id;})); },
  getSettings: function(){ return read(K.settings, window.DEMO_SETTINGS || {}); },
  saveSettings: function(s){ return write(K.settings, s); },
  getAnalytics: function(){ return read(K.analytics, {views:{}, copies:{}, downloads:{}, visits:0}); },
  saveAnalytics: function(a){ return write(K.analytics, a); },
  getSaved: function(){ var s = read(K.saved, null); if(!s || !Array.isArray(s.resources)){ s = {resources:[], prompts:[]}; } return s; },
  saveSaved: function(s){ return write(K.saved, s); },
  isSavedResource: function(slug){ return this.getSaved().resources.indexOf(slug) >= 0; },
  toggleSavedResource: function(slug){
    var s = this.getSaved(), i = s.resources.indexOf(slug), on;
    if(i >= 0){ s.resources.splice(i,1); on = false; } else { s.resources.push(slug); on = true; }
    write(K.saved, s); return on;
  },
  isSavedPrompt: function(key){ return this.getSaved().prompts.indexOf(key) >= 0; },
  toggleSavedPrompt: function(key){
    var s = this.getSaved(), i = s.prompts.indexOf(key), on;
    if(i >= 0){ s.prompts.splice(i,1); on = false; } else { s.prompts.push(key); on = true; }
    write(K.saved, s); return on;
  }
};
})();
