// CLIENT-SIDE ADMIN ONLY — NOT SECURE FOR REAL AUTHENTICATION.
// Anyone with source/browser access can bypass this gate. No server, no shared DB.
(function(){
'use strict';
var TYPES = ['GUIDE','PROMPT','TOOL','WORKFLOW','SYSTEM','TUTORIAL','DOWNLOAD'];
var PLATFORMS = ['ChatGPT','Claude','Gemini','Multi','AI Tools'];
var BLOCK_TYPES = [['h','عنوان'],['p','فقرة'],['list','قائمة'],['quote','اقتباس'],['img','صورة'],['code','كود'],['tip','نصيحة'],['warning','تحذير'],['info','معلومة'],['prompt','برومبت'],['table','جدول']];

function authed(){ try{ return sessionStorage.getItem('admin_auth') === '1'; }catch(e){ return false; } }
function getPwHash(){
  var s = Storage.getSettings() || {};
  return s.adminPasswordHash || '';
}
function getLegacyPw(){ return (Storage.getSettings() || {}).adminPassword || ''; }
function hasPwSet(){ return !!(getPwHash() || getLegacyPw()); }
async function hashPw(pw){
  if (window.crypto && crypto.subtle) {
    var data = new TextEncoder().encode('mta-lab-local::' + pw);
    var buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
  }
  return 'plain:' + pw;
}

function render(sub){
  Router.setMeta('الإدارة', '');
  var app = document.getElementById('app');
  if(!authed()){ gate(app); return; }
  var tab = sub[0] || 'dashboard';
  var links = [['dashboard','📊 لوحة التحكم'],['resources','📚 المصادر'],['categories','🗂 التصنيفات'],['files','📦 الملفات'],['settings','⚙ الإعدادات']];
  app.innerHTML = '<div class="container page"><div class="section-head-row"><h2>لوحة الإدارة</h2><button class="btn btn-ghost btn-sm" id="logout">خروج</button></div>' +
    '<div class="admin-layout"><aside class="admin-sidebar">' + links.map(function(l){
      return '<a class="admin-side-link' + (tab === l[0] ? ' active' : '') + '" href="#/admin/' + l[0] + '">' + l[1] + '</a>';
    }).join('') + '</aside><div class="admin-main" id="admin-main"></div></div></div>';
  document.getElementById('logout').onclick = function(){ try{ sessionStorage.removeItem('admin_auth'); }catch(e){} location.hash = '#/home'; };
  var M = document.getElementById('admin-main');
  if(tab === 'resources') listResources(M);
  else if(tab === 'categories') listCats(M);
  else if(tab === 'files') filesManager(M);
  else if(tab === 'settings') settings(M);
  else dash(M);
}
function gate(app){
  var hasPw = hasPwSet();
  app.innerHTML = '<div class="container page"><div class="admin-login"><h2>' + (hasPw ? 'دخول الإدارة' : 'إنشاء كلمة مرور') + '</h2>' +
    '<div class="notice notice-warn">Client-side admin only. This static version does not provide server-side security.</div>' +
    '<div class="form-group"><label class="form-label" for="pw">كلمة المرور</label><input class="form-input" type="password" id="pw"></div>' +
    '<button class="btn btn-primary" id="go" style="width:100%">' + (hasPw ? 'فتح اللوحة' : 'تعيين وفتح') + '</button><p class="form-hint" id="pw-err"></p></div></div>';
  async function go(){
    var v = document.getElementById('pw').value;
    if(!v || v.length < 4){ document.getElementById('pw-err').textContent = '4 أحرف على الأقل.'; return; }
    var h = await hashPw(v);
    if(hasPw){
      var storedHash = getPwHash();
      var legacyPw = getLegacyPw();
      if(storedHash){
        if(h !== storedHash){ document.getElementById('pw-err').textContent = 'كلمة خاطئة.'; return; }
      } else if(legacyPw){
        if(v !== legacyPw){ document.getElementById('pw-err').textContent = 'كلمة خاطئة.'; return; }
        // Migrate legacy plaintext password to SHA-256 hash and clear plaintext
        var sm = Storage.getSettings(); delete sm.adminPassword; sm.adminPasswordHash = h; Storage.saveSettings(sm);
      }
    } else {
      var s = Storage.getSettings(); delete s.adminPassword; s.adminPasswordHash = h; Storage.saveSettings(s);
    }
    try{ sessionStorage.setItem('admin_auth', '1'); }catch(e){}
    Router.render();
  }
  document.getElementById('go').onclick = go;
  document.getElementById('pw').addEventListener('keydown', function(e){ if(e.key === 'Enter') go(); });
}
/* ---------- Dashboard ---------- */
function dash(M){
  var R = Storage.getResources();
  var nPrompts = R.reduce(function(s,r){ return s + ((r.prompts||[]).length); }, 0);
  var nTools = R.filter(function(r){ return r.type === 'TOOL'; }).length;
  var nFiles = R.reduce(function(s,r){ return s + ((r.files||[]).length); }, 0);
  var t = Analytics.totals(), raw = Storage.getAnalytics();
  M.innerHTML = '<div class="admin-cards">' +
    card(R.length,'مصدر') + card(nPrompts,'برومبت') + card(nTools,'أداة') + card(nFiles,'ملف') + card(Storage.getCategories().length,'تصنيف') + '</div>' +
    '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(270px,1fr))">' +
    '<div class="res-card"><div class="res-body"><h3>النشاط (محلي)</h3>' +
    '<div class="stat-row"><span>الزيارات</span><strong>' + t.visits + '</strong></div>' +
    '<div class="stat-row"><span>المشاهدات</span><strong>' + t.views + '</strong></div>' +
    '<div class="stat-row"><span>النسخ</span><strong>' + t.copies + '</strong></div>' +
    '<div class="stat-row"><span>التحميلات</span><strong>' + t.downloads + '</strong></div></div></div>' +
    '<div class="res-card"><div class="res-body"><h3>الأكثر مشاهدة</h3>' + Analytics.barChart(Analytics.top(raw.views,5), function(x){ var r = Storage.getResource(x.id); return UI.esc(r ? r.title : x.id); }) + '</div></div>' +
    '<div class="res-card"><div class="res-body"><h3>الأكثر نسخًا</h3>' + Analytics.barChart(Analytics.top(raw.copies,5), function(x){ var r = Storage.getResource(x.id); return UI.esc(r ? r.title : x.id); }) + '</div></div></div>' +
    '<div class="res-card" style="margin-top:14px"><div class="res-body"><h3>نسخة احتياطية</h3><p class="form-hint">تصدير mta-lab-data.json بكل المحتوى والإعدادات.</p>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn btn-secondary btn-sm" id="exp">Export Data</button>' +
    '<button class="btn btn-secondary btn-sm" id="imp">Import Data</button>' +
    '<button class="btn btn-danger btn-sm" id="rst">إفراغ الكل</button></div></div></div>';
  function card(n,l){ return '<div class="admin-stat"><div class="admin-stat-num">' + n + '</div><div class="admin-stat-label">' + l + '</div></div>'; }
  bindBackup(M);
}
function bindBackup(root){
  root.querySelector('#exp').onclick = function(){
    var blob = new Blob([JSON.stringify(Storage.exportData(), null, 2)], {type:'application/json'});
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mta-lab-data.json'; a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
    UI.toast('تم تنزيل mta-lab-data.json', 'success');
  };
  root.querySelector('#imp').onclick = function(){
    var m = UI.openModal('استيراد البيانات', '<input type="file" id="imp-file" accept=".json" class="form-input"><p class="form-hint" id="imp-msg"></p>',
      {footer:'<button class="btn btn-ghost btn-sm" data-close>إلغاء</button><button class="btn btn-primary btn-sm" id="imp-go">استيراد</button>'});
    m.overlay.querySelector('#imp-go').onclick = function(){
      var f = m.overlay.querySelector('#imp-file').files[0];
      if(!f){ m.overlay.querySelector('#imp-msg').textContent = 'اختر ملف .json'; return; }
      var rd = new FileReader();
      rd.onload = function(){
        try{ var res = Storage.importData(JSON.parse(rd.result));
          if(res.ok){ m.close(); UI.toast('تم استيراد البيانات بنجاح', 'success'); render(['dashboard']); }
          else m.overlay.querySelector('#imp-msg').textContent = res.error;
        }catch(e){ m.overlay.querySelector('#imp-msg').textContent = 'ملف البيانات غير صالح'; }
      };
      rd.readAsText(f);
    };
  };
  root.querySelector('#rst').onclick = function(){
    UI.confirmModal('إفراغ المحتوى', 'هل تريد إفراغ كل المحتوى والبدء من جديد؟', function(){ Storage.resetDemo(); UI.toast('تم إفراغ المحتوى بنجاح', 'success'); render(['dashboard']); }, 'إفراغ');
  };
}
/* ---------- Resources ---------- */
function listResources(M){
  var rows = Storage.getResources().map(function(r){
    return '<tr><td>' + UI.esc(r.title).slice(0,50) + '<br><span class="form-hint">' + UI.esc(r.slug) + ' · ' + UI.esc(r.type) + '</span></td>' +
      '<td>' + UI.esc(r.category||'') + '</td><td><span class="pill ' + (r.published?'pill-on':'pill-off') + '">' + (r.published?'منشور':'مسودة') + '</span></td>' +
      '<td><div class="row-actions"><button class="mini-btn" data-act="edit" data-id="' + UI.esc(r.slug) + '">تعديل</button>' +
      '<button class="mini-btn" data-act="dup" data-id="' + UI.esc(r.slug) + '">تكرار</button>' +
      '<button class="mini-btn" data-act="pub" data-id="' + UI.esc(r.slug) + '">نشر/إخفاء</button>' +
      '<button class="mini-btn" data-act="feat" data-id="' + UI.esc(r.slug) + '">تمييز</button>' +
      '<button class="mini-btn danger" data-act="del" data-id="' + UI.esc(r.slug) + '">حذف</button></div></td></tr>';
  }).join('');
  M.innerHTML = '<div class="section-head-row"><h3>المصادر (' + Storage.getResources().length + ')</h3><button class="btn btn-primary btn-sm" id="add-btn">+ إضافة مصدر</button></div>' +
    '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>المصدر</th><th>التصنيف</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>' +
    (rows || '<tr><td colspan="4" style="text-align:center">لا توجد مصادر.</td></tr>') + '</tbody></table></div>';
  M.querySelector('#add-btn').onclick = function(){ resourceForm(null); };
  M.querySelectorAll('[data-act]').forEach(function(b){
    b.onclick = function(){
      var slug = b.getAttribute('data-id'), a = b.getAttribute('data-act'), r = Storage.getResource(slug);
      if(a === 'edit') resourceForm(r);
      if(a === 'dup' && r){ var c = JSON.parse(JSON.stringify(r)); c.slug = r.slug + '-copy'; c.title = r.title + ' (نسخة)'; c.views = 0; Storage.addResource(c); UI.toast('تم التكرار', 'success'); listResources(M); }
      if(a === 'pub' && r){ Storage.updateResource(slug, {published:!r.published}); listResources(M); }
      if(a === 'feat' && r){ Storage.updateResource(slug, {featured:!r.featured}); listResources(M); }
      if(a === 'del') UI.confirmModal('حذف المصدر', 'حذف «' + r.title + '» نهائيًا؟', function(){ Storage.deleteResource(slug); listResources(M); });
    };
  });
}
function field(label, name, val, type){
  if(type === 'textarea') return '<div class="form-group"><label class="form-label">' + label + '</label><textarea class="form-input form-textarea" name="' + name + '">' + UI.esc(val||'') + '</textarea></div>';
  if(type === 'check') return '<label class="checkbox-row"><input type="checkbox" name="' + name + '"' + (val?' checked':'') + '> ' + label + '</label>';
  return '<div class="form-group"><label class="form-label">' + label + '</label><input class="form-input" type="' + (type||'text') + '" name="' + name + '" value="' + UI.esc(val == null?'':val) + '"></div>';
}
function readForm(m, names){
  var o = {};
  names.forEach(function(n){ var el = m.querySelector('[name="' + n + '"]'); if(el) o[n] = (el.type === 'checkbox') ? el.checked : el.value; });
  return o;
}
function resourceForm(r){
  var isNew = !r;
  r = r || {title:'',title_en:'',description:'',description_en:'',type:'GUIDE',platform:'ChatGPT',category:'',tags:'',cover:'',readingTime:5,author:'Mohamed Tarek Abdelhady',website:'',date:new Date().toISOString().slice(0,10),featured:false,published:true,prompts:[],blocks:[],files:[]};
  var tagStr = Array.isArray(r.tags) ? r.tags.join('، ') : (r.tags || '');
  var draft = JSON.parse(JSON.stringify({prompts:r.prompts||[], blocks:r.blocks||[], files:r.files||[]}));
  var m = UI.openModal(isNew ? 'إضافة مصدر' : 'تعديل مصدر',
    field('العنوان (عربي)','title',r.title) + field('English Title','title_en',r.title_en || '') +
    field('وصف قصير','description',r.description,'textarea') + field('Short Description (EN)','description_en',r.description_en || '') +
    '<div class="form-row"><div class="form-group"><label class="form-label">النوع</label><select class="form-input" name="type">' + TYPES.map(function(t){ return '<option value="' + t + '"' + (r.type===t?' selected':'') + '>' + t + '</option>'; }).join('') + '</select></div>' +
    '<div class="form-group"><label class="form-label">المنصة</label><select class="form-input" name="platform">' + PLATFORMS.map(function(p){ return '<option' + (r.platform===p?' selected':'') + '>' + p + '</option>'; }).join('') + '</select></div></div>' +
    '<div class="form-row"><div class="form-group"><label class="form-label">التصنيف</label><select class="form-input" name="category"><option value="">— بدون تصنيف —</option>' + Storage.getCategories().map(function(c){ return '<option value="' + UI.esc(c.id) + '"' + (r.category===c.id?' selected':'') + '>' + UI.esc(c.name) + '</option>'; }).join('') + '</select></div>' +
    field('المؤلف','author',r.author) + '</div>' +
    '<div class="form-row">' + field('زمن القراءة (دقيقة)','readingTime',r.readingTime,'number') + field('التاريخ','date',r.date,'date') + '</div>' +
    field('الوسوم (افصل بفاصلة)','tags',tagStr) + field('صورة الغلاف (رابط أو assets/images/…)','cover',r.cover || '') + field('رابط الأداة الرسمي (للأدوات فقط)','website',r.website || '','url') +
    field('مميز','featured',r.featured,'check') + field('منشور','published',r.published,'check') +
    '<hr style="border:none;border-top:1px solid var(--color-border);margin:18px 0">' +
    '<h4>🧱 محتوى المصدر (بدون كتابة HTML)</h4><p class="form-hint">أضف عناوين وفقرات وقوائم وبرومبتات وأكواد وتنبيهات وجداول بالترتيب الذي تريده.</p><div id="blk-list"></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 18px"><select class="form-input" id="blk-type" style="flex:1;min-width:140px">' + BLOCK_TYPES.map(function(b){ return '<option value="' + b[0] + '">' + b[1] + '</option>'; }).join('') + '</select><button type="button" class="btn btn-secondary btn-sm" id="blk-add">+ إضافة مكوّن</button></div>' +
    '<hr style="border:none;border-top:1px solid var(--color-border);margin:18px 0">' +
    '<h4>⌨️ البرومبتات</h4><p class="form-hint">يمكن للمصدر أن يحتوي عدة برومبتات، لكل منها زر نسخ مستقل.</p><div id="prm-list"></div>' +
    '<button type="button" class="btn btn-secondary btn-sm" id="prm-add" style="margin-bottom:16px">+ إضافة برومبت</button>' +
    '<hr style="border:none;border-top:1px solid var(--color-border);margin:18px 0">' +
    '<h4>📦 ملفات المصدر</h4><p class="form-hint">أضف بيانات الملف، وضع الملف الحقيقي في assets/files/ (انظر تبويب الملفات).</p><div id="file-list"></div>' +
    '<button type="button" class="btn btn-secondary btn-sm" id="file-add">+ إضافة ملف</button>',
    {large:true, footer:'<button class="btn btn-ghost" data-close>إلغاء</button><button class="btn btn-primary" id="save">حفظ المصدر</button>'});

  function paintBlocks(){
    var box = m.body.querySelector('#blk-list');
    box.innerHTML = draft.blocks.length ? draft.blocks.map(function(b, i){
      var label = (BLOCK_TYPES.find(function(x){ return x[0] === b.t; }) || [b.t, b.t])[1];
      var prev = (b.t === 'h' || b.t === 'p') ? ' — ' + UI.esc(String(b.text || '').slice(0, 50)) : (b.t === 'prompt' ? ' — ' + UI.esc(b.promptId || '') : '');
      return '<div class="block-item"><strong>#' + (i+1) + ' ' + UI.esc(label) + '</strong><span class="form-hint">' + prev + '</span>' +
        '<span style="margin-inline-start:auto;display:flex;gap:6px"><button type="button" class="mini-btn" data-b="up" data-i="' + i + '">↑</button>' +
        '<button type="button" class="mini-btn" data-b="down" data-i="' + i + '">↓</button>' +
        '<button type="button" class="mini-btn" data-b="edit" data-i="' + i + '">تعديل</button>' +
        '<button type="button" class="mini-btn danger" data-b="del" data-i="' + i + '">حذف</button></span></div>';
    }).join('') : '<p class="form-hint">لا توجد مكونات بعد.</p>';
    box.querySelectorAll('[data-b]').forEach(function(btn){
      btn.onclick = function(){
        var i = +btn.getAttribute('data-i'), a = btn.getAttribute('data-b');
        if(a === 'del') draft.blocks.splice(i, 1);
        if(a === 'up' && i > 0){ var t = draft.blocks[i-1]; draft.blocks[i-1] = draft.blocks[i]; draft.blocks[i] = t; }
        if(a === 'down' && i < draft.blocks.length - 1){ var u = draft.blocks[i+1]; draft.blocks[i+1] = draft.blocks[i]; draft.blocks[i] = u; }
        if(a === 'edit') blockEditor(draft.blocks[i], draft.prompts);
        paintBlocks();
      };
    });
  }
  function paintPrompts(){
    var box = m.body.querySelector('#prm-list');
    box.innerHTML = draft.prompts.length ? draft.prompts.map(function(p, i){
      return '<div class="block-item"><strong>⌨️ ' + UI.esc(p.title || ('برومبت ' + (i+1))) + '</strong><span class="form-hint">' + UI.esc(p.id) + '</span>' +
        '<span style="margin-inline-start:auto;display:flex;gap:6px"><button type="button" class="mini-btn" data-p="edit" data-i="' + i + '">تعديل</button>' +
        '<button type="button" class="mini-btn danger" data-p="del" data-i="' + i + '">حذف</button></span></div>';
    }).join('') : '<p class="form-hint">لا توجد برومبتات بعد.</p>';
    box.querySelectorAll('[data-p]').forEach(function(btn){
      btn.onclick = function(){
        var i = +btn.getAttribute('data-i');
        if(btn.getAttribute('data-p') === 'del') draft.prompts.splice(i, 1);
        else promptEditor(draft.prompts[i]);
        paintPrompts(); paintBlocks();
      };
    });
  }
  function paintFiles(){
    var box = m.body.querySelector('#file-list');
    box.innerHTML = draft.files.length ? draft.files.map(function(f, i){
      return '<div class="block-item"><strong>📄 ' + UI.esc(f.name) + '</strong><span class="form-hint">' + UI.esc(f.type || '') + ' · ' + UI.esc(f.size || '') + '</span>' +
        '<button type="button" class="mini-btn danger" data-f="' + i + '" style="margin-inline-start:auto">حذف</button></div>';
    }).join('') : '<p class="form-hint">لا توجد ملفات.</p>';
    box.querySelectorAll('[data-f]').forEach(function(btn){ btn.onclick = function(){ draft.files.splice(+btn.getAttribute('data-f'), 1); paintFiles(); }; });
  }
  m.body.querySelector('#blk-add').onclick = function(){
    var t = m.body.querySelector('#blk-type').value;
    var nb = {t:t};
    if(t === 'list') nb.items = ['نقطة أولى'];
    else if(t === 'code') nb = {t:'code', lang:'javascript', code:'// code'};
    else if(t === 'img') nb = {t:'img', src:'', alt:''};
    else if(t === 'prompt') nb = {t:'prompt', promptId:(draft.prompts[0] && draft.prompts[0].id) || ''};
    else if(t === 'table') nb = {t:'table', head:['العمود 1','العمود 2'], rows:[['…','…']]};
    else if(t === 'tip' || t === 'warning' || t === 'info') nb.title = '';
    if(t !== 'list' && t !== 'code' && t !== 'img' && t !== 'prompt' && t !== 'table') nb.text = '';
    if(nb.title === '') nb.title = t === 'warning' ? 'تنبيه' : (t === 'tip' ? 'نصيحة' : 'ملاحظة');
    draft.blocks.push(nb);
    blockEditor(nb, draft.prompts); paintBlocks();
  };
  m.body.querySelector('#prm-add').onclick = function(){
    var np = {id:'prompt-' + (draft.prompts.length + 1), title:'برومبت جديد', description:'', content:'', language:'ar', models:['ChatGPT'], tags:[]};
    draft.prompts.push(np); promptEditor(np); paintPrompts(); paintBlocks();
  };
  m.body.querySelector('#file-add').onclick = function(){ fileEditor(null, draft); paintFiles(); };
  paintBlocks(); paintPrompts(); paintFiles();
  function onRef(){
    if(m.overlay && m.overlay.classList.contains('open') && m.overlay.innerHTML){ paintBlocks(); paintPrompts(); paintFiles(); }
    else { document.removeEventListener('admin-refresh', onRef); }
  }
  document.addEventListener('admin-refresh', onRef);

  m.overlay.querySelector('#save').onclick = function(){
    var v = readForm(m.body, ['title','title_en','description','description_en','type','platform','category','tags','cover','website','readingTime','date','author','featured','published']);
    if(!v.title.trim()){ UI.toast('العنوان مطلوب', 'error'); return; }
    if(v.website && !UI.safeUrl(v.website)){ UI.toast('رابط الأداة يجب أن يبدأ بـ http', 'error'); return; }
    var rec = {title:v.title.trim(), title_en:v.title_en.trim(), description:v.description.trim(), description_en:v.description_en.trim(),
      type:v.type, platform:v.platform, category:v.category, author:v.author.trim() || 'فريق المصادر',
      tags:String(v.tags).split(/[,،]/).map(function(s){ return s.trim(); }).filter(Boolean),
      cover:v.cover.trim(), website:v.website.trim(), readingTime:parseInt(v.readingTime, 10) || 5, date:v.date || new Date().toISOString().slice(0,10),
      featured:!!v.featured, published:!!v.published, prompts:draft.prompts, blocks:draft.blocks, files:draft.files};
    if(isNew){ rec.slug = ''; Storage.addResource(rec); }
    else Storage.updateResource(r.slug, rec);
    m.close(); UI.toast('تم الحفظ — ظهر على الموقع فورًا', 'success'); render(['resources']);
  };
}
function blockEditor(b, prompts){
  var body = '';
  if(b.t === 'h' || b.t === 'p' || b.t === 'quote') body = '<div class="form-group"><label class="form-label">النص</label><textarea class="form-input form-textarea" id="be-text">' + UI.esc(b.text || '') + '</textarea></div>';
  if(b.t === 'tip' || b.t === 'warning' || b.t === 'info') body = '<div class="form-group"><label class="form-label">العنوان</label><input class="form-input" id="be-title" value="' + UI.esc(b.title || '') + '"></div><div class="form-group"><label class="form-label">النص</label><textarea class="form-input form-textarea" id="be-text">' + UI.esc(b.text || '') + '</textarea></div>';
  if(b.t === 'list') body = '<div class="form-group"><label class="form-label">عنصر في كل سطر</label><textarea class="form-input form-textarea" id="be-text">' + UI.esc((b.items || []).join('\n')) + '</textarea></div>';
  if(b.t === 'code') body = '<div class="form-group"><label class="form-label">اللغة</label><input class="form-input" id="be-lang" value="' + UI.esc(b.lang || '') + '" dir="ltr"></div><div class="form-group"><label class="form-label">الكود</label><textarea class="form-input form-textarea" id="be-text" dir="ltr" style="font-family:var(--font-mono)">' + UI.esc(b.code || '') + '</textarea></div>';
  if(b.t === 'img') body = '<div class="form-group"><label class="form-label">رابط الصورة</label><input class="form-input" id="be-src" value="' + UI.esc(b.src || '') + '" dir="ltr"></div><div class="form-group"><label class="form-label">وصف الصورة</label><input class="form-input" id="be-alt" value="' + UI.esc(b.alt || '') + '"></div>';
  if(b.t === 'prompt' && !(prompts || []).length) body = '<div class="notice notice-warn">أضف برومبتًا أولًا من قسم البرومبتات بالأسفل، ثم اختره هنا.</div>';
  else if(b.t === 'prompt') body = '<div class="form-group"><label class="form-label">اختر البرومبت</label><select class="form-input" id="be-pid">' + (prompts || []).map(function(p){ return '<option value="' + UI.esc(p.id) + '"' + (b.promptId === p.id ? ' selected' : '') + '>' + UI.esc(p.title) + '</option>'; }).join('') + '</select></div>';
  if(b.t === 'table') body = '<div class="form-group"><label class="form-label">الرؤوس (افصل ب | )</label><input class="form-input" id="be-head" value="' + UI.esc((b.head || []).join(' | ')) + '"></div><div class="form-group"><label class="form-label">الصفوف (سطر لكل صف، وافصل الخلايا ب | )</label><textarea class="form-input form-textarea" id="be-rows">' + UI.esc((b.rows || []).map(function(r){ return r.join(' | '); }).join('\n')) + '</textarea></div>';
  var m2 = UI.openModal('تعديل مكوّن', body || '<p class="form-hint">—</p>', {footer:'<button class="btn btn-primary btn-sm" id="be-save">تم</button>'});
  m2.overlay.querySelector('#be-save').onclick = function(){
    function val(id){ var el = m2.body.querySelector('#' + id); return el ? el.value : ''; }
    if(b.t === 'h' || b.t === 'p' || b.t === 'quote') b.text = val('be-text');
    if(b.t === 'tip' || b.t === 'warning' || b.t === 'info'){ b.title = val('be-title'); b.text = val('be-text'); }
    if(b.t === 'list') b.items = val('be-text').split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
    if(b.t === 'code'){ b.lang = val('be-lang'); b.code = val('be-text'); }
    if(b.t === 'img'){ b.src = val('be-src'); b.alt = val('be-alt'); }
    if(b.t === 'prompt') b.promptId = val('be-pid');
    if(b.t === 'table'){ b.head = val('be-head').split('|').map(function(s){ return s.trim(); }); b.rows = val('be-rows').split('\n').map(function(l){ return l.split('|').map(function(s){ return s.trim(); }); }).filter(function(r){ return r.length && r[0]; }); }
    m2.close();
  };
}
function promptEditor(p){
  var m2 = UI.openModal('تعديل برومبت',
    '<div class="form-group"><label class="form-label">معرّف (إنجليزي بلا مسافات)</label><input class="form-input" id="pe-id" value="' + UI.esc(p.id) + '" dir="ltr"></div>' +
    '<div class="form-group"><label class="form-label">عنوان البرومبت</label><input class="form-input" id="pe-title" value="' + UI.esc(p.title || '') + '"></div>' +
    '<div class="form-group"><label class="form-label">الوصف</label><input class="form-input" id="pe-desc" value="' + UI.esc(p.description || '') + '"></div>' +
    '<div class="form-group"><label class="form-label">محتوى البرومبت</label><textarea class="form-input form-textarea" id="pe-content" dir="ltr" style="font-family:var(--font-mono);min-height:170px">' + UI.esc(p.content || '') + '</textarea></div>' +
    '<div class="form-row"><div class="form-group"><label class="form-label">اللغة</label><select class="form-input" id="pe-lang"><option value="ar"' + (p.language==='ar'?' selected':'') + '>عربي</option><option value="en"' + (p.language==='en'?' selected':'') + '>English</option><option value="both"' + (p.language==='both'?' selected':'') + '>Both</option></select></div>' +
    '<div class="form-group"><label class="form-label">متوافق مع (افصل بفاصلة)</label><input class="form-input" id="pe-models" value="' + UI.esc((p.models || []).join(', ')) + '" dir="ltr"></div></div>',
    {large:true, footer:'<button class="btn btn-primary btn-sm" id="pe-save">تم</button>'});
  m2.overlay.querySelector('#pe-save').onclick = function(){
    function val(id){ return m2.body.querySelector('#' + id).value; }
    p.id = val('pe-id').trim().replace(/\s+/g, '-') || p.id;
    p.title = val('pe-title').trim(); p.description = val('pe-desc').trim(); p.content = val('pe-content');
    p.language = val('pe-lang'); p.models = val('pe-models').split(',').map(function(s){ return s.trim(); }).filter(Boolean);
    if(!p.title || !p.content){ UI.toast('العنوان والمحتوى مطلوبان', 'error'); return; }
    m2.close();
  };
}
function fileEditor(f, draft){
  f = f || {name:'', type:'', size:'', path:''};
  var m2 = UI.openModal('بيانات الملف',
    '<div class="notice notice-info">المتصفح لا يستطيع رفع الملف إلى الخادم. ضع الملف الحقيقي في <code dir="ltr">assets/files/</code> ثم سجّل بياناته هنا. اختر ملفًا من جهازك لمعاينة اسمه وحجمه تلقائيًا.</div>' +
    '<div class="form-group"><label class="form-label">اختيار ملف (للمعاينة فقط)</label><input type="file" id="fe-pick" class="form-input"><p class="form-hint" id="fe-msg"></p></div>' +
    '<div class="form-group"><label class="form-label">اسم الملف</label><input class="form-input" id="fe-name" value="' + UI.esc(f.name) + '" dir="ltr"></div>' +
    '<div class="form-row"><div class="form-group"><label class="form-label">النوع</label><input class="form-input" id="fe-type" value="' + UI.esc(f.type) + '" dir="ltr"></div>' +
    '<div class="form-group"><label class="form-label">الحجم</label><input class="form-input" id="fe-size" value="' + UI.esc(f.size) + '" dir="ltr"></div></div>' +
    '<div class="form-group"><label class="form-label">المسار داخل المشروع</label><input class="form-input" id="fe-path" value="' + UI.esc(f.path || '/article/assets/files/') + '" dir="ltr"><p class="form-hint">مثال: /article/assets/files/guide.pdf</p></div>',
    {footer:'<button class="btn btn-primary btn-sm" id="fe-save">إضافة</button>'});
  m2.body.querySelector('#fe-pick').addEventListener('change', function(e){
    var file = e.target.files[0]; if(!file) return;
    m2.body.querySelector('#fe-name').value = file.name;
    var ext = (file.name.split('.').pop() || '').toUpperCase();
    m2.body.querySelector('#fe-type').value = ext;
    m2.body.querySelector('#fe-size').value = file.size > 1048576 ? (file.size/1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(file.size/1024)) + ' KB';
    m2.body.querySelector('#fe-path').value = '/article/assets/files/' + file.name;
    m2.body.querySelector('#fe-msg').textContent = 'انسخ هذا الملف يدويًا إلى مجلد assets/files/ في المشروع ليصبح التحميل حقيقيًا.';
  });
  m2.overlay.querySelector('#fe-save').onclick = function(){
    function val(id){ return m2.body.querySelector('#' + id).value.trim(); }
    if(!val('fe-name') || !val('fe-path')){ UI.toast('الاسم والمسار مطلوبان', 'error'); return; }
    draft.files.push({name:val('fe-name'), type:val('fe-type') || 'FILE', size:val('fe-size') || '—', path:val('fe-path')});
    m2.close();
  };
}
/* ---------- Categories ---------- */
function listCats(M){
  var rows = Storage.getCategories().map(function(c){
    var n = ResourcesPage.published().filter(function(r){ return r.category === c.id; }).length;
    return '<tr><td>' + UI.esc(c.icon || '') + ' ' + UI.esc(c.name) + (c.name_en ? ' / ' + UI.esc(c.name_en) : '') + ' (' + n + ')</td><td><code>' + UI.esc(c.id) + '</code></td>' +
      '<td><button class="mini-btn danger" data-del="' + UI.esc(c.id) + '">حذف</button></td></tr>';
  }).join('');
  M.innerHTML = '<div class="section-head-row"><h3>التصنيفات</h3><button class="btn btn-primary btn-sm" id="add-btn">+ إضافة تصنيف</button></div>' +
    '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>الاسم</th><th>المعرف</th><th></th></tr></thead><tbody>' + (rows || '<tr><td colspan="3">—</td></tr>') + '</tbody></table></div>';
  M.querySelector('#add-btn').onclick = function(){
    var m = UI.openModal('إضافة تصنيف', field('الاسم (عربي)','name','') + field('Name (EN)','name_en','') + field('أيقونة','icon','📁'),
      {footer:'<button class="btn btn-primary btn-sm" id="save">حفظ</button>'});
    m.overlay.querySelector('#save').onclick = function(){
      var name = m.body.querySelector('[name="name"]').value.trim();
      if(!name){ UI.toast('الاسم مطلوب', 'error'); return; }
      Storage.addCategory({name:name, name_en:m.body.querySelector('[name="name_en"]').value.trim(), icon:m.body.querySelector('[name="icon"]').value.trim() || '📁'});
      m.close(); listCats(M);
    };
  };
  M.querySelectorAll('[data-del]').forEach(function(b){
    b.onclick = function(){ UI.confirmModal('حذف التصنيف', 'حذف هذا التصنيف؟ (لن تُحذف المصادر)', function(){ Storage.deleteCategory(b.getAttribute('data-del')); listCats(M); }); };
  });
}
/* ---------- Files manager ---------- */
function filesManager(M){
  var rows = [];
  Storage.getResources().forEach(function(r){
    (r.files || []).forEach(function(f){
      rows.push('<tr><td dir="ltr" style="text-align:right">' + UI.esc(f.name) + '<br><span class="form-hint">' + UI.esc(r.title).slice(0,40) + '</span></td><td>' + UI.esc(f.type || '') + '</td><td>' + UI.esc(f.size || '') + '</td><td><code dir="ltr">' + UI.esc(f.path) + '</code></td></tr>');
    });
  });
  M.innerHTML = '<h3>الملفات (' + rows.length + ')</h3>' +
    '<div class="notice notice-info">المتصفح لا يستطيع تعديل ملفات الخادم. سجّل بيانات الملف هنا من نافذة المصدر، ثم انسخ الملف الحقيقي يدويًا إلى <code dir="ltr">assets/files/</code> وصدّر <code dir="ltr">resources.json</code> للاحتفاظ بالبيانات.</div>' +
    '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>الملف</th><th>النوع</th><th>الحجم</th><th>المسار</th></tr></thead><tbody>' + (rows.join('') || '<tr><td colspan="4" style="text-align:center">لا توجد ملفات.</td></tr>') + '</tbody></table></div>';
}
/* ---------- Settings ---------- */
function settings(M){
  var s = Storage.getSettings();
  M.innerHTML = '<div class="res-card"><div class="res-body"><h3>إعدادات الموقع</h3>' +
    field('اسم الموقع (عربي)','siteNameAr',s.siteNameAr || '') + field('Site Name (EN)','siteName',s.siteName || '') +
    field('الوصف','tagline',s.tagline || '','textarea') +
    '<button class="btn btn-primary btn-sm" id="save-s">حفظ</button></div></div>' +
    '<div class="res-card" style="margin-top:14px"><div class="res-body"><h3>كلمة مرور الإدارة</h3>' +
    '<div class="notice notice-warn">Client-side admin only. This static version does not provide server-side security.</div>' +
    '<div class="form-group"><label class="form-label">كلمة جديدة</label><input type="password" class="form-input" id="np"></div>' +
    '<button class="btn btn-secondary btn-sm" id="save-p">تحديث</button></div></div>' +
    '<div class="res-card" style="margin-top:14px"><div class="res-body"><h3>نسخة احتياطية</h3>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-secondary btn-sm" id="exp">Export Data</button><button class="btn btn-secondary btn-sm" id="imp">Import Data</button><button class="btn btn-danger btn-sm" id="rst">إفراغ الكل</button></div></div></div>';
  M.querySelector('#save-s').onclick = function(){
    var cur = Storage.getSettings();
    cur.siteNameAr = M.querySelector('[name="siteNameAr"]').value; cur.siteName = M.querySelector('[name="siteName"]').value; cur.tagline = M.querySelector('[name="tagline"]').value;
    Storage.saveSettings(cur); UI.toast('تم الحفظ', 'success');
  };
  M.querySelector('#save-p').onclick = async function(){
    var v = M.querySelector('#np').value;
    if(!v || v.length < 4){ UI.toast('4 أحرف على الأقل', 'error'); return; }
    var cur = Storage.getSettings(); delete cur.adminPassword; cur.adminPasswordHash = await hashPw(v); Storage.saveSettings(cur);
    UI.toast('تم تحديث الكلمة', 'success'); M.querySelector('#np').value = '';
  };
  bindBackup(M);
}
window.Admin = {render:render};
})();
