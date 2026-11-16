/* Translations — Arabic primary, English secondary. No duplicated pages. */
(function(){
'use strict';
var T = {
ar:{nav_home:'الرئيسية',nav_articles:'المقالات',nav_tools:'أدوات AI',nav_prompts:'البرومبتات',nav_resources:'المصادر',nav_about:'عني',nav_downloads:'التنزيلات',nav_saved:'المحفوظات',nav_admin:'الإدارة',nav_portfolio:'Portfolio ↗',
brand_sub:'مقالات ومصادر تقنية',
hero_badge:'منصة شخصية — صُنعت بشغف',hero_title:'اكتشف • تعلّم • ابنِ',
hero_desc:'منصة شخصية تجمع أدوات الذكاء الاصطناعي، البرومبتات، المقالات التقنية، الـWorkflows والمصادر العملية.',
explore_articles:'استكشف المقالات',browse_prompts_btn:'تصفح البرومبتات',
sec_featured:'محتوى مميز',sec_latest_art:'أحدث المقالات',
articles_title:'المقالات',articles_sub:'مقالات وشروحات تقنية: ذكاء اصطناعي، برمجة، هندسة وإنتاجية.',
resources_title:'المصادر',resources_sub:'ملفات حقيقية للتحميل، أدلة، قوالب وروابط مفيدة مختارة بعناية.',
files_sec:'ملفات للتحميل',guides_sec:'أدلة وقوالب',links_sec:'روابط مفيدة',
about_title:'عن المطور',about_role:'مهندس اتصالات وإلكترونيات — مطور ويب ومصمم PCB',
about_desc:'منصة تقنية شخصية ومعرفية من تطوير محمد طارق عبدالهادي، تركز على الذكاء الاصطناعي والسوفتوير والإلكترونيات والهندسة والتقنية العملية.',
built_with:'صُنع بـ',about_cta:'تصفح المقالات',
footer_built:'Built & Developed by',footer_quote:'"Building at the intersection of hardware, software and AI."',
footer_explore:'استكشف',footer_links:'روابط',footer_contact:'تواصل',
footer_rights:'Mohamed Tarek Abdelhady — جميع الحقوق محفوظة.',footer_designed:'صُمم وطُوّر بواسطة محمد طارق عبدالهادي',
search_ph:'ابحث عن أداة، برومبت، دليل...',search:'بحث',explore:'استكشف المصادر',latest_prompts:'أحدث البرومبتات',
featured:'مصادر مميزة',latest:'أحدث المصادر',popular_prompts:'برومبتات شائعة',categories:'التصنيفات',downloads:'ملفات للتحميل',view_all:'عرض الكل',
all_resources:'كل المصادر',all_desc:'اكتشف البرومبتات والأدلة والأدوات وسير العمل والمصادر التقنية.',
f_all:'الكل',sort_newest:'الأحدث',sort_views:'الأكثر مشاهدة',sort_copies:'الأكثر نسخًا',sort_az:'A-Z',
read:'اقرأ الدليل',copy_prompt:'نسخ البرومبت',copied:'تم النسخ ✓',copy_all:'نسخ الكل',copy_done:'تم نسخ البرومبت بنجاح',
saved_add:'تمت الإضافة إلى المحفوظات',saved_remove:'تمت الإزالة من المحفوظات',download:'تحميل',dl_started:'بدأ التحميل',
type_GUIDE:'دليل',type_PROMPT:'برومبت',type_TOOL:'أداة',type_WORKFLOW:'سير عمل',type_SYSTEM:'نظام',type_TUTORIAL:'شرح',type_DOWNLOAD:'ملف',
saved_title:'مصادري المحفوظة',saved_sub:'كل ما حفظته من مصادر وبرومبتات في مكان واحد.',toc:'المحتويات',related:'مصادر ذات صلة',
prompts_in:'برومبتات هذا المصدر',files_in:'ملفات التحميل',share:'مشاركة',link_copied:'تم نسخ الرابط',
min_read:'دقائق قراءة',no_results:'لا توجد نتائج مطابقة',try_other:'جرّب كلمة أخرى أو غيّر الفلاتر.',back:'رجوع'},
en:{nav_home:'Home',nav_articles:'Articles',nav_tools:'AI Tools',nav_prompts:'Prompts',nav_resources:'Resources',nav_about:'About',nav_downloads:'Downloads',nav_saved:'Saved',nav_admin:'Admin',nav_portfolio:'Portfolio ↗',
brand_sub:'Articles & AI Knowledge Hub',
hero_badge:'A personal platform — crafted with passion',hero_title:'Explore. Learn. Build.',
hero_desc:'A personal collection of AI tools, prompts, technical articles, workflows, resources and practical knowledge.',
explore_articles:'Explore Articles',browse_prompts_btn:'Browse Prompts',
sec_featured:'Featured Content',sec_latest_art:'Latest Articles',
articles_title:'Articles',articles_sub:'Technical articles and tutorials: AI, programming, engineering and productivity.',
resources_title:'Resources',resources_sub:'Real downloadable files, guides, templates and hand-picked useful links.',
files_sec:'Downloadable files',guides_sec:'Guides & templates',links_sec:'Useful links',
about_title:'About the Developer',about_role:'Communications & Electronics Engineer — Web Developer & PCB Designer',
about_desc:'A technical portfolio and personal knowledge platform by Mohamed Tarek Abdelhady, focused on AI, software, electronics, engineering, and practical technology.',
built_with:'Built with',about_cta:'Browse Articles',
footer_built:'Built & Developed by',footer_quote:'"Building at the intersection of hardware, software and AI."',
footer_explore:'Explore',footer_links:'Links',footer_contact:'Contact',
footer_rights:'Mohamed Tarek Abdelhady — All rights reserved.',footer_designed:'Designed & Developed by Mohamed Tarek Abdelhady',
search_ph:'Search tools, prompts, guides...',search:'Search',explore:'Explore Resources',latest_prompts:'Latest Prompts',
featured:'Featured Resources',latest:'Latest Resources',popular_prompts:'Popular Prompts',categories:'Categories',downloads:'Downloads',view_all:'View all',
all_resources:'All Resources',all_desc:'Discover prompts, guides, tools, workflows and technical resources.',
f_all:'All',sort_newest:'Newest',sort_views:'Most viewed',sort_copies:'Most copied',sort_az:'A-Z',
read:'Read Guide',copy_prompt:'Copy Prompt',copied:'Copied ✓',copy_all:'Copy All',copy_done:'Prompt copied successfully',
saved_add:'Added to saved',saved_remove:'Removed from saved',download:'Download',dl_started:'Download started',
type_GUIDE:'Guide',type_PROMPT:'Prompt',type_TOOL:'Tool',type_WORKFLOW:'Workflow',type_SYSTEM:'System',type_TUTORIAL:'Tutorial',type_DOWNLOAD:'File',
saved_title:'My Saved Resources',saved_sub:'Everything you saved in one place.',toc:'Contents',related:'Related resources',
prompts_in:'Prompts in this resource',files_in:'Downloadable files',share:'Share',link_copied:'Link copied',
min_read:'min read',no_results:'No matching results',try_other:'Try another keyword or change filters.',back:'Back'}
};
var TYPE_ICON = {GUIDE:'📖',PROMPT:'⌨️',TOOL:'🧰',WORKFLOW:'🔁',SYSTEM:'⚙️',TUTORIAL:'🎓',DOWNLOAD:'📦'};
function lang(){ try{ return localStorage.getItem('lang') || 'ar'; }catch(e){ return 'ar'; } }
function setLang(l){
  try{ localStorage.setItem('lang', l); }catch(e){}
  document.documentElement.lang = l;
  document.documentElement.dir = (l === 'ar') ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    var k = el.getAttribute('data-i18n'); if(T[l] && T[l][k]) el.textContent = T[l][k];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el){
    var k = el.getAttribute('data-i18n-ph'); if(T[l] && T[l][k]) el.setAttribute('placeholder', T[l][k]);
  });
  var b = document.getElementById('langToggle'); if(b) b.textContent = (l === 'ar') ? 'EN' : 'عربي';
  if(window.Router) Router.render();
}
window.I18n = {
  t:function(k){ var l = lang(); return (T[l] && T[l][k]) || T.ar[k] || k; },
  lang:lang, setLang:setLang, typeIcon:function(t){ return TYPE_ICON[t] || '📄'; },
  apply:function(){
    var l = lang();
    document.documentElement.lang = l; document.documentElement.dir = (l === 'ar') ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(function(el){ var k = el.getAttribute('data-i18n'); if(T[l]&&T[l][k]) el.textContent = T[l][k]; });
    document.querySelectorAll('[data-i18n-ph]').forEach(function(el){ var k = el.getAttribute('data-i18n-ph'); if(T[l]&&T[l][k]) el.setAttribute('placeholder', T[l][k]); });
    var b = document.getElementById('langToggle'); if(b) b.textContent = (l === 'ar') ? 'EN' : 'عربي';
  }
};
})();
