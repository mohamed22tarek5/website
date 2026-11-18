/* Reusable components. All user content escaped; blocks allowlist-sanitized. */
(function(){
'use strict';
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function safeUrl(u){
  if(!u) return false;
  try{ var p = new URL(u, location.href); return ['http:','https:','mailto:'].indexOf(p.protocol) >= 0; }
  catch(e){ return false; }
}
function safeImgUrl(u){
  if(!u || typeof u !== 'string') return false;
  var t = u.trim();
  if(!t || t.indexOf('//') === 0) return false;
  try{
    var p = new URL(t, location.href);
    return p.protocol === 'https:' || (p.protocol === location.protocol && p.origin === location.origin);
  }catch(e){ return false; }
}
function toast(msg, type){
  var c = document.getElementById('toast-container'); if(!c) return;
  var t = document.createElement('div'); t.className = 'toast ' + (type || ''); t.setAttribute('role','status'); t.textContent = msg;
  c.appendChild(t);
  requestAnimationFrame(function(){ t.classList.add('show'); });
  setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 300); }, 2600);
}
var lastFocus = null;
var modalStack = [];
function openModal(title, bodyHtml, opts){
  opts = opts || {};
  var ov = document.getElementById('modal-overlay');
  if(ov.classList.contains('open')){ /* stacked modal above the current one */
    ov = document.getElementById('modal-overlay-sub');
    if(!ov){
      ov = document.createElement('div');
      ov.id = 'modal-overlay-sub'; ov.className = 'modal-overlay'; ov.style.zIndex = '9500';
      document.body.appendChild(ov);
    }
  } else {
    lastFocus = document.activeElement;
  }
  ov.innerHTML = '<div class="modal' + (opts.large ? ' modal-lg' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="modal-header"><h3>' + esc(title) + '</h3><button class="icon-btn" data-close aria-label="Close">✕</button></div><div class="modal-body"></div>' + (opts.footer ? '<div class="modal-footer"></div>' : '') + '</div>';
  var body = ov.querySelector('.modal-body');
  if(typeof bodyHtml === 'string') body.innerHTML = bodyHtml; else if(bodyHtml) body.appendChild(bodyHtml);
  if(opts.footer){ var f = ov.querySelector('.modal-footer'); if(typeof opts.footer === 'string') f.innerHTML = opts.footer; else f.appendChild(opts.footer); }
  ov.classList.add('open');
  var rec = {ov:ov, close:null};
  modalStack.push(rec);
  function close(){
    ov.classList.remove('open'); ov.innerHTML = '';
    document.removeEventListener('keydown', onKey, true);
    var i = modalStack.indexOf(rec); if(i >= 0) modalStack.splice(i, 1);
    if(!modalStack.length && lastFocus && lastFocus.focus) lastFocus.focus();
    try{ document.dispatchEvent(new CustomEvent('admin-refresh')); }catch(e){}
  }
  rec.close = close;
  function onKey(e){
    if(modalStack[modalStack.length - 1] !== rec) return; /* only topmost modal reacts */
    if(e.key === 'Escape') close();
    if(e.key === 'Tab'){
      var fl = Array.from(ov.querySelectorAll('button,input,select,textarea,a[href]')).filter(function(x){return !x.disabled;});
      if(!fl.length) return;
      var first = fl[0], last = fl[fl.length-1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  }
  ov.onclick = function(e){ if(e.target === ov || e.target.closest('[data-close]')) close(); };
  document.addEventListener('keydown', onKey, true);
  setTimeout(function(){ var i = ov.querySelector('input,textarea,select'); if(i) i.focus(); }, 60);
  return {close:close, body:body, overlay:ov};
}
function confirmModal(title, msg, onYes, yesLabel){
  var m = openModal(title, '<p style="color:var(--color-text-secondary)">' + esc(msg) + '</p>',
    {footer:'<button class="btn btn-ghost btn-sm" data-close>إلغاء</button><button class="btn btn-danger btn-sm" id="cf-yes">' + esc(yesLabel || 'حذف') + '</button>'});
  m.overlay.querySelector('#cf-yes').onclick = function(){ m.close(); onYes(); };
}
function copyText(text, btn, doneLabel){
  function done(){
    toast(window.I18n.t('copy_done'), 'success');
    if(btn){ var o = btn.innerHTML; btn.innerHTML = esc(doneLabel || window.I18n.t('copied')); btn.disabled = true;
      setTimeout(function(){ btn.innerHTML = o; btn.disabled = false; }, 1600); }
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(done).catch(function(){ fallback(); });
  } else fallback();
  function fallback(){
    var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); done(); }catch(e){ toast('Copy failed', 'error'); }
    ta.remove();
  }
}
function hl(text, q){
  var e = esc(text); if(!q) return e;
  try{ return e.replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')', 'gi'), '<mark>$1</mark>'); }
  catch(err){ return e; }
}
/* Resource helpers */
function titleOf(r){ return (I18n.lang() === 'ar' ? (r.title || r.title_en) : (r.title_en || r.title)) || ''; }
function descOf(r){ return (I18n.lang() === 'ar' ? (r.description || r.description_en) : (r.description_en || r.description)) || ''; }
function catName(id){
  var c = (Storage.getCategories() || []).find(function(x){return x.id === id;});
  if(!c) return id;
  return I18n.lang() === 'ar' ? c.name : (c.name_en || c.name);
}
function resourceCard(r, highlight){
  function H(s){ return highlight ? highlight(s) : esc(s); }
  var feat = r.featured ? '<span class="feat-badge">★</span>' : '';
  var web = r.website && safeUrl(r.website) ? '<a class="btn btn-ghost btn-sm" href="' + esc(r.website) + '" target="_blank" rel="noopener noreferrer">↗</a>' : '';
  var btn = (r.type === 'PROMPT' && (r.prompts||[]).length)
    ? '<button class="btn btn-primary btn-sm" data-copy-first="' + esc(r.slug) + '">⧉ ' + esc(I18n.t('copy_prompt')) + '</button>'
    : '<a class="btn btn-primary btn-sm" href="#/resource/' + esc(r.slug) + '">' + esc(I18n.t('read')) + '</a>';
  var saved = Storage.isSavedResource(r.slug);
  var views = Number(r.views) || 0;
  var copies = Number(r.copies) || 0;
  return '<article class="res-card reveal revealed' + (r.featured ? ' feat' : '') + '">' +
    (r.cover && safeImgUrl(r.cover) ? '<img class="res-cover" src="' + esc(r.cover) + '" alt="" loading="lazy">' : '') + '<div class="res-body">' +
    '<div class="res-badges"><span class="type-badge type-' + esc(r.type) + '">' + esc(I18n.typeIcon(r.type)) + ' ' + esc(I18n.t('type_' + r.type)) + '</span>' +
    (r.platform ? '<span class="plat-badge">' + H(r.platform) + '</span>' : '') + feat + '</div>' +
    '<h3 class="res-title"><a href="#/resource/' + esc(r.slug) + '">' + H(titleOf(r)) + '</a></h3>' +
    '<p class="res-desc">' + H(descOf(r)) + '</p>' +
    '<div class="res-meta"><span>⏱ ' + esc(String(Number(r.readingTime) || 5)) + ' ' + esc(I18n.t('min_read')) + '</span><span>📅 ' + esc(r.date || '') + '</span><span>👁 ' + views + '</span>' + (copies ? '<span>⧉ ' + copies + '</span>' : '') + '</div>' +
    '<div class="res-tags">' + ((r.tags||[]).slice(0,4).map(function(t){ return '<span class="tag">' + H(t) + '</span>'; }).join('')) + '</div>' +
    '<div class="res-footer">' + btn + web +
    '<button class="save-btn' + (saved ? ' active' : '') + '" data-save-res="' + esc(r.slug) + '" aria-label="Save" aria-pressed="' + saved + '">♥</button></div>' +
    '</div></article>';
}
function promptBlock(slug, p, showDesc){
  var key = slug + ':' + p.id;
  var saved = Storage.isSavedPrompt(key);
  return '<div class="prompt-block"><div class="prompt-block-head"><span>⌨️ ' + esc(p.title) + '</span>' +
    '<button class="save-btn' + (saved ? ' active' : '') + '" data-save-prompt="' + esc(key) + '" aria-label="Save prompt" aria-pressed="' + saved + '" style="width:32px;height:32px">♥</button></div>' +
    (showDesc !== false && p.description ? '<p class="prompt-desc" style="padding:10px 16px 0">' + esc(p.description) + '</p>' : '') +
    '<div class="prompt-block-body">' + esc(p.content) + '</div>' +
    '<div class="prompt-block-foot"><button class="btn btn-primary btn-sm" data-copy-prompt="' + esc(key) + '">' + esc(I18n.t('copy_prompt')) + '</button>' +
    ((p.models||[]).map(function(m){ return '<span class="tag">' + esc(m) + '</span>'; }).join('')) + '</div></div>';
}
function renderBlocks(blocks, slug){
  var byPrompt = {};
  var r = slug ? Storage.getResource(slug) : null;
  (r && r.prompts || []).forEach(function(p){ byPrompt[p.id] = p; });
  return (blocks || []).map(function(b){
    if(b.t === 'h') return '<h2>' + esc(b.text) + '</h2>';
    if(b.t === 'p') return '<p>' + esc(b.text) + '</p>';
    if(b.t === 'list') return '<ul>' + ((b.items||[]).map(function(i){ return '<li>' + esc(i) + '</li>'; }).join('')) + '</ul>';
    if(b.t === 'quote') return '<div class="quote-box">' + esc(b.text) + '</div>';
    if(b.t === 'img') return safeImgUrl(b.src) ? '<img src="' + esc(b.src) + '" alt="' + esc(b.alt || '') + '" loading="lazy">' : '';
    if(b.t === 'code') return '<div class="code-block"><span class="cb-lang">' + esc(b.lang || 'code') + '</span>' + esc(b.code) + '</div>';
    if(b.t === 'tip') return '<div class="tip-box"><strong>💡 ' + esc(b.title || 'نصيحة') + '</strong>' + esc(b.text) + '</div>';
    if(b.t === 'warning') return '<div class="warning-box"><strong>⚠️ ' + esc(b.title || 'تنبيه') + '</strong>' + esc(b.text) + '</div>';
    if(b.t === 'info') return '<div class="info-box"><strong>ℹ️ ' + esc(b.title || 'ملاحظة') + '</strong>' + esc(b.text) + '</div>';
    if(b.t === 'prompt' && byPrompt[b.promptId]) return promptBlock(slug, byPrompt[b.promptId]);
    if(b.t === 'table') return '<div class="data-table-wrap"><table class="data-table"><thead><tr>' + ((b.head||[]).map(function(h){ return '<th>' + esc(h) + '</th>'; }).join('')) + '</tr></thead><tbody>' + ((b.rows||[]).map(function(row){ return '<tr>' + (row.map(function(c){ return '<td>' + esc(c) + '</td>'; }).join('')) + '</tr>'; }).join('')) + '</tbody></table></div>';
    return '';
  }).join('');
}
function emptyState(icon, title, sub, btn){
  return '<div class="empty"><div class="empty-icon">' + icon + '</div><h3>' + esc(title) + '</h3><p>' + esc(sub || '') + '</p>' + (btn || '') + '</div>';
}
window.UI = {esc:esc, safeUrl:safeUrl, safeImgUrl:safeImgUrl, toast:toast, openModal:openModal, confirmModal:confirmModal,
  copyText:copyText, hl:hl, titleOf:titleOf, descOf:descOf, catName:catName,
  resourceCard:resourceCard, promptBlock:promptBlock, renderBlocks:renderBlocks, emptyState:emptyState};
})();
