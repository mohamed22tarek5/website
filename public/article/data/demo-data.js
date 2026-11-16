/* Original demo content (Arabic-first). No copied text from any website. */
(function(){
'use strict';
window.DEMO_CATEGORIES = [
  {id:'chatgpt', name:'ChatGPT', name_en:'ChatGPT', icon:'💬'},
  {id:'claude', name:'Claude', name_en:'Claude', icon:'🟧'},
  {id:'gemini', name:'Gemini', name_en:'Gemini', icon:'✨'},
  {id:'ai-tools', name:'AI Tools', name_en:'AI Tools', icon:'🧰'},
  {id:'prompts', name:'برومبتات', name_en:'Prompts', icon:'⌨️'},
  {id:'guides', name:'أدلة', name_en:'Guides', icon:'📖'},
  {id:'workflows', name:'سير عمل', name_en:'Workflows', icon:'🔁'},
  {id:'systems', name:'أنظمة', name_en:'Systems', icon:'⚙️'},
  {id:'programming', name:'برمجة', name_en:'Programming', icon:'💻'},
  {id:'engineering', name:'هندسة', name_en:'Engineering', icon:'🔌'},
  {id:'electronics', name:'إلكترونيات', name_en:'Electronics', icon:'🔋'},
  {id:'pcb', name:'PCB', name_en:'PCB', icon:'🟩'},
  {id:'web', name:'تطوير ويب', name_en:'Web Development', icon:'🌐'},
  {id:'tutorials', name:'شروحات', name_en:'Tutorials', icon:'🎬'},
  {id:'education', name:'تعليم', name_en:'Education', icon:'🎓'},
  {id:'writing', name:'كتابة', name_en:'Writing', icon:'✍️'},
  {id:'seo', name:'SEO', name_en:'SEO', icon:'🔍'},
  {id:'productivity', name:'إنتاجية', name_en:'Productivity', icon:'⚡'}
];

window.DEMO_RESOURCES = [
{
  slug:'chatgpt-secret-modes', title:'15 وضعًا مخصصًا لـ ChatGPT ترفع جودة إجاباتك',
  title_en:'15 custom modes for ChatGPT', description:'أوضاع جاهزة للنسخ: نقد صارم، حقيقة بلا مجاملة، وتفكير عميق قبل الإجابة.',
  description_en:'Copy-ready modes: brutal critique, truth mode and deep thinking.',
  type:'PROMPT', platform:'ChatGPT', category:'prompts', tags:['برومبت','ChatGPT','أوضاع','تفكير'],
  cover:'', readingTime:6, author:'Mohamed Tarek Abdelhady', date:'2026-08-12', featured:true, published:true, views:342, copies:187, downloads:0,
  prompts:[
    {id:'brutal-mode', title:'الوضع الصارم — BRUTAL MODE', description:'نقد مباشر بلا مجاملة مع درجات واضحة لكل مشكلة.', language:'both', models:['ChatGPT','Claude','Gemini'], tags:['نقد','مراجعة'],
     content:'MODE 1: BRUTAL MODE\n\nWhenever I type BRUTAL MODE, follow these rules:\n1. Critique my work directly. No compliments, no softening.\n2. List every flaw: logic, clarity, accuracy, structure.\n3. Rate each issue: [Critical / Major / Minor].\n4. Explain WHY each issue matters in one line.\n5. Give one concrete fix per issue.\n6. End with a verdict: Ship it / Fix first / Rewrite.\n\nBe professional, never rude. If something is good, say it in one line maximum.'},
    {id:'truth-mode', title:'وضع الحقيقة — TRUTH MODE', description:'إجابات صادقة تذكر عدم اليقين بدل التخمين.', language:'both', models:['ChatGPT','Claude','Gemini'], tags:['صدق','تحقق'],
     content:'TRUTH MODE\n\nFrom now on:\n- Say "I am not sure" when you are not sure. Never guess silently.\n- Separate facts from opinions clearly.\n- When I ask for facts, add your confidence level: High / Medium / Low.\n- Correct me when I am wrong, even if I insist.\n- Keep answers short unless I ask for details.'},
    {id:'deep-think', title:'وضع التفكير العميق', description:'يفكر بصوت عالٍ قبل الإجابة النهائية.', language:'ar', models:['ChatGPT','Claude'], tags:['تفكير','تحليل'],
     content:'وضع التفكير العميق\n\nقبل أن تجيب على أي سؤال معقد:\n1. اعرض فهمك للسؤال في سطرين.\n2. اذكر 3 زوايا مختلفة للنظر إلى المشكلة.\n3. قارن بين الحلول الممكنة في جدول.\n4. اختر أفضل حل وبرر اختيارك.\n5. اذكر المخاطر والافتراضات التي بنيت عليها إجابتك.'}
  ],
  blocks:[
    {t:'p', text:'معظم الإجابات الضعيفة ليست مشكلة في النموذج، بل في طريقة السؤال. هذه الأوضاع الثلاثة تغيّر سلوك المساعد فور نسخها في بداية المحادثة.'},
    {t:'h', text:'كيف تستخدم الأوضاع؟'},
    {t:'list', items:['انسخ الوضع المناسب من الأسفل والصقه أول المحادثة.','اكتب اسم الوضع (مثل BRUTAL MODE) كلما أردت تفعيله.','يمكنك دمج وضعين: ابدأ بالتفكير العميق ثم اطلب النقد الصارم.']},
    {t:'tip', title:'نصيحة', text:'احفظ الأوضاع في صفحة المحفوظات (♥) لتصل إليها بسرعة من أي جهاز عبر ملف التصدير.'},
    {t:'warning', title:'تنبيه', text:'الوضع الصارم ينتقد العمل فقط، لا تستخدمه في محادثات حساسة أو مع نصوص شخصية.'}
  ],
  files:[{name:'chatgpt-modes-cheatsheet.md', type:'MD', size:'3 KB', path:'assets/files/chatgpt-modes-cheatsheet.md'}]
},
{
  slug:'chatgpt-for-programmers', title:'دليل استخدام ChatGPT للمبرمجين',
  title_en:'ChatGPT guide for programmers', description:'من كتابة الكود إلى مراجعته واختباره: سير عمل عملي بأمثلة.',
  description_en:'From writing code to reviewing and testing it.',
  type:'GUIDE', platform:'ChatGPT', category:'programming', tags:['برمجة','دليل','كود'],
  cover:'', readingTime:10, author:'Mohamed Tarek Abdelhady', date:'2026-08-05', featured:true, published:true, views:298, copies:64, downloads:12,
  prompts:[
    {id:'code-explainer', title:'برومبت شرح الأكواد', description:'يشرح أي كود سطرًا بسطر مع رسم تدفق منطقي.', language:'both', models:['ChatGPT','Claude'], tags:['شرح','كود'],
     content:'Explain this code to me like I am a junior developer:\n\n[PASTE CODE HERE]\n\n1. What does it do in one sentence?\n2. Walk through it step by step.\n3. Point out 2 tricky parts and explain them.\n4. Suggest one small improvement.'}
  ],
  blocks:[
    {t:'p', text:'الذكاء الاصطناعي مساعد ممتاز للمبرمج عندما تعطيه سياقًا دقيقًا: لغة البرمجة، الهدف، والقيود. هذا الدليل يعطيك سير عمل من ثلاث خطوات.'},
    {t:'h', text:'1. اكتب المواصفات أولًا'},
    {t:'p', text:'قبل طلب الكود، اكتب: المدخلات والمخرجات المتوقعة، الحالات الحدّية، ومثالًا واحدًا على الأقل. كلما كان الوصف أدق قلّت الأخطاء.'},
    {t:'code', lang:'javascript', code:'// Bad: "write a login function"\n// Good: "write login(email, password) in Node.js:\n// - returns {token} or throws InvalidCredentials\n// - bcrypt compare, 3 attempts then 60s lockout"'},
    {t:'h', text:'2. راجع ثم اختبر'},
    {t:'list', items:['اطلب مراجعة أمنية: حقن، تحقق من المدخلات، أسرار مكشوفة.','اطلب حالات اختبار للحالات الحدّية قبل كتابة الاختبارات.','الصق رسالة الخطأ كاملة مع رقم السطر عند طلب الإصلاح.']},
    {t:'tip', title:'نصيحة', text:'اطلب من النموذج شرح الكود الذي كتبه لك بسطر واحد لكل دالة — إذا عجز عن الشرح فالكود غالبًا معقد أكثر من اللازم.'},
    {t:'table', head:['الخطوة','ماذا تطلب','مثال'], rows:[['كتابة','دالة بمواصفات دقيقة','دالة تسجيل دخول مع قفل مؤقت'],['مراجعة','تدقيق أمني','ابحث عن ثغرات الحقن'],['اختبار','حالات حدّية','مدخلات فارغة وطويلة جدًا']]},
    {t:'prompt', promptId:'code-explainer'}
  ],
  files:[]
},
{
  slug:'code-review-prompt', title:'برومبت تحليل ومراجعة الأكواد',
  title_en:'Code review prompt', description:'مراجعة شاملة: أخطاء، أداء، أمان، وقابلية قراءة مع أولويات إصلاح.',
  description_en:'Full review: bugs, performance, security and readability.',
  type:'PROMPT', platform:'Multi', category:'programming', tags:['مراجعة','أمان','أداء'],
  cover:'', readingTime:4, author:'Mohamed Tarek Abdelhady', date:'2026-07-28', featured:false, published:true, views:176, copies:143, downloads:31,
  prompts:[
    {id:'full-review', title:'مراجعة شاملة للكود', description:'تقرير مرتب بالأولويات مع مقترحات كود جاهزة.', language:'both', models:['ChatGPT','Claude','Gemini'], tags:['مراجعة'],
     content:'Review the following code as a senior engineer:\n\n[PASTE CODE HERE]\n\nReport:\nA) Bugs (with line numbers and fixes)\nB) Security issues (injection, secrets, validation)\nC) Performance problems (complexity + fix)\nD) Readability (naming, duplication)\n\nRules:\n- Order findings by severity: Blocker / Major / Minor.\n- Show corrected code for every Blocker.\n- If context is missing, ask max 3 questions first.'}
  ],
  blocks:[
    {t:'p', text:'الصق هذا البرومبت ثم الكود تحته مباشرة. يعمل بشكل أفضل عندما تذكر لغة البرمجة وإصدارها في أول سطر.'},
    {t:'quote', text:'المراجعة الجيدة لا تقول "هذا سيئ" بل تقول "هذا سيكسر عندما…" مع رقم السطر.'}
  ],
  files:[{name:'code-review-prompt.txt', type:'TXT', size:'2 KB', path:'assets/files/code-review-prompt.txt'}]
},
{
  slug:'research-prompt', title:'برومبت البحث العلمي والتلخيص',
  title_en:'Research and summary prompt', description:'يلخص الأوراق العلمية ويستخرج المنهجية والنتائج والقيود في جدول.',
  description_en:'Summarize papers: method, results and limitations.',
  type:'PROMPT', platform:'Claude', category:'education', tags:['بحث','تلخيص','دراسة'],
  cover:'', readingTime:4, author:'Mohamed Tarek Abdelhady', date:'2026-07-20', featured:false, published:true, views:129, copies:98, downloads:0,
  prompts:[
    {id:'paper-summary', title:'ملخص ورقة علمية', description:'بطاقة بحثية منظمة مع درجة ثقة لكل معلومة.', language:'ar', models:['Claude','ChatGPT'], tags:['تلخيص'],
     content:'أنت مساعد بحث أكاديمي.\n\nلخص الورقة التالية في بطاقة بحثية:\n1. سؤال البحث والفرضية (سطران).\n2. المنهجية والعينة (3 نقاط).\n3. أهم 3 نتائج بالأرقام.\n4. القيود التي ذكرها الباحثون.\n5. 3 أسئلة لم تُجب عنها الورقة.\n\nضع بعد كل معلومة درجة الثقة: [مذكور نصًا / مستنتج].\n\n[الصق نص الورقة هنا]'}
  ],
  blocks:[
    {t:'p', text:'مصمم للطلاب والباحثين: يفرّق بين ما قالته الورقة فعلًا وما استنتجه النموذج، وهذه أهم ميزة فيه.'},
    {t:'warning', title:'تنبيه', text:'لا تعتمد على المراجع التي يولدها النموذج دون تحقق — تحقق من كل مرجع في قاعدة بيانات علمية.'}
  ],
  files:[]
},
{
  slug:'content-writing-prompt', title:'برومبت كتابة المحتوى العربي',
  title_en:'Arabic content writing prompt', description:'يحوّل الأفكار المبعثرة إلى مقال عربي واضح بهيكل ثابت.',
  description_en:'Turn rough ideas into a clear Arabic article.',
  type:'PROMPT', platform:'Gemini', category:'writing', tags:['كتابة','محتوى','عربي'],
  cover:'', readingTime:4, author:'Mohamed Tarek Abdelhady', date:'2026-07-15', featured:false, published:true, views:154, copies:121, downloads:0,
  prompts:[
    {id:'ar-writer', title:'كاتب المحتوى العربي', description:'مقال فصيح مبسط مع أمثلة وعناوين جذابة.', language:'ar', models:['Gemini','ChatGPT','Claude'], tags:['كتابة'],
     content:'أنت كاتب محتوى عربي محترف.\n\nحوّل هذه الأفكار إلى مقال:\n[الصق أفكارك هنا]\n\nالشروط:\n- عربية فصحى بسيطة، جمل قصيرة.\n- عنوان جذاب + 3 عناوين فرعية.\n- مثال عملي واحد على الأقل.\n- خاتمة فيها خطوة عملية واحدة للقارئ.\n- تجنب الحشو: كل فقرة معلومة جديدة.'}
  ],
  blocks:[{t:'p', text:'يعمل مع المقالات والمنشورات والنشرات البريدية. جرّبه أولًا على فكرة واحدة صغيرة قبل مقال كامل.'}],
  files:[]
},
{
  slug:'deep-thinking-system', title:'نظام التفكير العميق: قرارات أفضل في خطوتين',
  title_en:'Deep thinking system', description:'نظام من خطوتين: استكشاف واسع ثم تضييق حاسم — لأي قرار معقد.',
  description_en:'Two-step system: diverge then converge.',
  type:'SYSTEM', platform:'Multi', category:'systems', tags:['تفكير','قرارات','نظام'],
  cover:'', readingTime:7, author:'Mohamed Tarek Abdelhady', date:'2026-07-10', featured:true, published:true, views:211, copies:76, downloads:0,
  prompts:[
    {id:'diverge', title:'الخطوة 1: التوسيع', description:'يولّد بدائل وزوايا قبل الحكم.', language:'ar', models:['ChatGPT','Claude','Gemini'], tags:['تفكير'],
     content:'نظام التفكير العميق — الخطوة 1 (التوسيع):\n\nموضوع القرار: [...]\n\n1. اذكر 5 حلول ممكنة على الأقل، بما فيها حل غير تقليدي.\n2. لكل حل: التكلفة، الوقت، والمخاطرة (سطر واحد لكل منها).\n3. لا تختر بعد — فقط اعرض الخريطة كاملة.'},
    {id:'converge', title:'الخطوة 2: الحسم', description:'يقارن ويختار بمعايير واضحة.', language:'ar', models:['ChatGPT','Claude','Gemini'], tags:['قرار'],
     content:'الخطوة 2 (الحسم):\n\nقارن بين الحلول السابقة وفق هذه المعايير بالترتيب:\n1. الأثر على الهدف الأساسي.\n2. التكلفة والوقت.\n3. قابلية التراجع عن القرار.\n\nاختر حلًا واحدًا وبرر سبب رفض البقية في سطر واحد لكل حل.'}
  ],
  blocks:[
    {t:'p', text:'الفكرة: معظم القرارات السيئة تأتي من التسرع في الاختيار قبل رؤية البدائل. هذا النظام يفصل الاستكشاف عن الحسم.'},
    {t:'h', text:'متى تستخدمه؟'},
    {t:'list', items:['اختيار تقنية أو أداة لمشروع.','قرارات الشراء المكلفة.','تحديد أولويات العمل عند تزاحم المهام.']},
    {t:'info', title:'ملاحظة', text:'انسخ الخطوة الأولى أولًا، وبعد ظهور البدائل انسخ الثانية في نفس المحادثة.'}
  ],
  files:[]
},
{
  slug:'ai-tools-for-engineers', title:'أفضل أدوات AI للمهندسين: دليل عملي',
  title_en:'Best AI tools for engineers', description:'خارطة عملية: تصميم، محاكاة، توثيق — ماذا تستخدم ومتى.',
  description_en:'Practical map: design, simulation and docs.',
  type:'GUIDE', platform:'AI Tools', category:'engineering', tags:['هندسة','أدوات','دليل'],
  cover:'', readingTime:9, author:'Mohamed Tarek Abdelhady', date:'2026-06-28', featured:true, published:true, views:265, copies:41, downloads:58,
  prompts:[
    {id:'tool-picker', title:'برومبت اختيار الأداة', description:'يقترح الأداة المناسبة حسب مهمتك وميزانيتك.', language:'ar', models:['ChatGPT','Claude'], tags:['اختيار'],
     content:'أنا مهندس أعمل على: [صف مشروعك في سطرين].\nميزانيتي: [مجاني / مدفوع].\n\nاقترح 3 أدوات ذكاء اصطناعي مناسبة مع:\n- ماذا تفعل كل أداة بالضبط.\n- متى لا تصلح (قيودها).\n- أيها أبدأ به ولماذا.'}
  ],
  blocks:[
    {t:'p', text:'أدوات الذكاء الاصطناعي للمهندسين تنقسم إلى ثلاث عائلات. اختر من كل عائلة أداة واحدة فقط في البداية.'},
    {t:'table', head:['العائلة','مثال استخدام','نصيحة'], rows:[['مساعدات الكود','كتابة سكربتات الاختبار','راجع مخرجاتها على عتاد حقيقي'],['أدوات التوثيق','تحويل الملاحظات لتقارير','أضف الأرقام بنفسك دائمًا'],['أدوات البحث','مقارنة المكونات','تحقق من الأسعار والتوفر']]},
    {t:'tip', title:'نصيحة', text:'ابدأ بالأداة المجانية التي تحل أكثر مهمة تكرارًا في يومك، لا بالأداة الأشهر.'}
  ],
  files:[{name:'ai-tools-list.csv', type:'CSV', size:'1 KB', path:'assets/files/ai-tools-list.csv'}]
},
{
  slug:'kicad-pcb-tool', title:'أداة KiCad لتصميم الدوائر المطبوعة',
  title_en:'KiCad PCB design tool', description:'حزمة تصميم مفتوحة المصدر: مخطط، تخطيط، وعرض ثلاثي الأبعاد.',
  description_en:'Open-source suite: schematic, layout and 3D viewer.',
  type:'TOOL', platform:'AI Tools', category:'engineering', tags:['PCB','KiCad','تصميم'],
  cover:'', readingTime:3, author:'Mohamed Tarek Abdelhady', date:'2026-06-20', featured:false, published:true, views:143, copies:0, downloads:22, website:'https://www.kicad.org',
  prompts:[],
  blocks:[
    {t:'p', text:'KiCad هو الخيار الأول المجاني لتصميم الدوائر المطبوعة: يدعم المخططات متعددة الصفحات، وقواعد التصميم DRC، وتصدير ملفات Gerber للمصانع.'},
    {t:'list', items:['مجاني ومفتوح المصدر بالكامل.','مكتبة رموز وبصمات ضخمة.','عارض ثلاثي الأبعاد للوحة قبل التصنيع.']}
  ],
  files:[]
},
{
  slug:'arduino-ide-tool', title:'أداة Arduino IDE للبرمجة المدمجة',
  title_en:'Arduino IDE tool', description:'البيئة الرسمية لبرمجة الأردوينو وESP32 مع مدير مكتبات.',
  description_en:'Official IDE for Arduino and ESP32.',
  type:'TOOL', platform:'AI Tools', category:'engineering', tags:['أردوينو','مدمج','ESP32'],
  cover:'', readingTime:3, author:'Mohamed Tarek Abdelhady', date:'2026-06-18', featured:false, published:true, views:132, copies:0, downloads:19, website:'https://www.arduino.cc/en/software',
  prompts:[],
  blocks:[
    {t:'p', text:'بيئة التطوير الرسمية من أردوينو: محرر بسيط، مراقب تسلسلي، ومدير لوحات يدعم ESP32 وESP8266 بإضافة رابط واحد.'},
    {t:'code', lang:'cpp', code:'void setup() {\n  Serial.begin(115200);\n  pinMode(LED_BUILTIN, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(500);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(500);\n}'}
  ],
  files:[{name:'arduino-blink.ino', type:'INO', size:'1 KB', path:'assets/files/arduino-blink.ino'}]
},
{
  slug:'esp32-first-project', title:'أول مشروع ESP32: من الوميض إلى الإنترنت',
  title_en:'First ESP32 project tutorial', description:'درس عملي: توصيل حساس حرارة وعرض القراءة على الويب.',
  description_en:'Hands-on: temperature sensor to web dashboard.',
  type:'TUTORIAL', platform:'AI Tools', category:'engineering', tags:['ESP32','IoT','تعليمي'],
  cover:'', readingTime:12, author:'Mohamed Tarek Abdelhady', date:'2026-06-10', featured:false, published:true, views:187, copies:22, downloads:44,
  prompts:[
    {id:'esp-debug', title:'برومبت تصحيح أعطال ESP32', description:'يشخص الأعطال الشائعة بخطوات اختبار سريعة.', language:'both', models:['ChatGPT','Claude'], tags:['تصحيح'],
     content:'You are an ESP32 troubleshooting expert.\n\nMy problem: [DESCRIBE HERE]\nMy wiring: [PINS USED]\n\n1. List the 3 most likely causes, ordered by probability.\n2. For each: one test under 2 minutes to confirm it.\n3. Give the fix with corrected wiring or code.\n4. End with a checklist to avoid this next time.'}
  ],
  blocks:[
    {t:'p', text:'سنبني عقدة تقرأ الحرارة وتعرضها على صفحة ويب محلية. المكونات: لوحة ESP32، حساس DHT22، ومقاومة 10k.'},
    {t:'h', text:'التوصيل'},
    {t:'list', items:['طرف البيانات من الحساس إلى GPIO15 مع مقاومة سحب 10k إلى 3V3.','أرضي مشترك بين كل المكونات.','تغذية مستقرة 5V — لا تعتمد على منفذ لابتوب ضعيف.']},
    {t:'code', lang:'cpp', code:'#include <WiFi.h>\nconst char* SSID = "lab-network";\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(SSID, "password");\n  while (WiFi.status() != WL_CONNECTED) delay(500);\n  Serial.println(WiFi.localIP());\n}'},
    {t:'warning', title:'تنبيه', text:'أطراف ESP32 تعمل بمنطق 3.3V فقط — لا توصل 5V مباشرة إلى أي طرف إدخال.'},
    {t:'prompt', promptId:'esp-debug'}
  ],
  files:[{name:'arduino-blink.ino', type:'INO', size:'1 KB', path:'assets/files/arduino-blink.ino'}]
},
{
  slug:'seo-basics-ai', title:'أساسيات SEO مع أدوات الذكاء الاصطناعي',
  title_en:'SEO basics with AI tools', description:'ابحث عن الكلمات، حسّن العناوين، وراجع مقالاتك بخطة من 5 خطوات.',
  description_en:'Keywords, titles and audits in 5 steps.',
  type:'GUIDE', platform:'Multi', category:'seo', tags:['SEO','كتابة','تدقيق'],
  cover:'', readingTime:8, author:'Mohamed Tarek Abdelhady', date:'2026-05-30', featured:false, published:true, views:118, copies:35, downloads:0,
  prompts:[
    {id:'seo-audit', title:'برومبت تدقيق المقال', description:'يراجع المقال ويعطي أهم 5 إصلاحات مرتبة.', language:'ar', models:['ChatGPT','Claude','Gemini'], tags:['تدقيق'],
     content:'راجع هذا المقال لتحسين محركات البحث:\n\n[الصق المقال هنا]\n\nأعطني:\n1. تقييمًا من 100 للعنوان والعناوين والوصف.\n2. أهم 5 إصلاحات مرتبة حسب الأثر.\n3. 3 عناوين بديلة مقترحة.\n4. وصفًا ميتا من 150 حرفًا.'}
  ],
  blocks:[
    {t:'p', text:'الذكاء الاصطناعي يسرّع عمل SEO لكنه لا يغني عن الفهم: المحتوى المفيد أولًا، والتحسين التقني ثانيًا.'},
    {t:'h', text:'خطة من 5 خطوات'},
    {t:'list', items:['اختر كلمة رئيسية واحدة لكل صفحة.','اكتب عنوانًا يعد بفائدة واضحة.','قسّم النص بعناوين فرعية كل 300 كلمة.','أضف وصفًا ميتا ورابطًا نظيفًا.','راجع السرعة والتوافق مع الجوال.']}
  ],
  files:[]
},
{
  slug:'morning-focus-workflow', title:'سير عمل التركيز الصباحي بالإنتاجية الذكية',
  title_en:'Morning focus workflow', description:'نظام 30 دقيقة: تخطيط، تنفيذ عميق، ومراجعة — مع برومبتات جاهزة.',
  description_en:'30-minute system: plan, deep work, review.',
  type:'WORKFLOW', platform:'Multi', category:'productivity', tags:['إنتاجية','تركيز','نظام'],
  cover:'', readingTime:6, author:'Mohamed Tarek Abdelhady', date:'2026-05-22', featured:false, published:true, views:96, copies:57, downloads:0,
  prompts:[
    {id:'plan-day', title:'برومبت تخطيط اليوم', description:'يحوّل قائمة المهام إلى خطة مركزة بثلاث أولويات.', language:'ar', models:['ChatGPT','Claude'], tags:['تخطيط'],
     content:'هذه مهامي اليوم: [...]\n\nرتبها لي:\n1. أهم 3 مهام فقط (قاعدة 3).\n2. مهمة واحدة لو أنجزتها ينجح اليوم.\n3. ما الذي أؤجله أو أحذفه؟\n4. وزعها على فترتين: تركيز عميق + مهام خفيفة.'},
    {id:'review-day', title:'برومبت مراجعة المساء', description:'مراجعة 5 دقائق تستخرج درسًا واحدًا لليوم التالي.', language:'ar', models:['ChatGPT','Claude'], tags:['مراجعة'],
     content:'راجع يومي معي في 5 دقائق:\nأنجزت: [...]\nتعثرت في: [...]\n\n1. ما السبب الجذري للتعثر؟ (سطر واحد)\n2. ما درس واحد أطبقه غدًا؟\n3. ما أول مهمة أبدأ بها صباحًا؟'}
  ],
  blocks:[
    {t:'p', text:'سير العمل هذا من ثلاث محطات يومية لا تتجاوز 30 دقيقة مجتمعة. انسخ البرومبتين معًا بزر واحد أو كلًا على حدة.'},
    {t:'list', items:['الصباح (10 دقائق): تخطيط ببرومبت اليوم.','منتصف اليوم: تنفيذ عميق بلا إشعارات.','المساء (5 دقائق): مراجعة ببرومبت المساء.']}
  ],
  files:[]
},
{
  slug:'starter-files-pack', title:'حزمة ملفات البداية: تحميل مباشر',
  title_en:'Starter files pack', description:'ملفات حقيقية جاهزة للتحميل: شيتات، سكربتات، وقوائم أدوات.',
  description_en:'Real ready-to-download files.',
  type:'DOWNLOAD', platform:'Multi', category:'productivity', tags:['تحميل','ملفات','قوالب'],
  cover:'', readingTime:2, author:'Mohamed Tarek Abdelhady', date:'2026-05-15', featured:false, published:true, views:88, copies:0, downloads:73,
  prompts:[],
  blocks:[
    {t:'p', text:'كل الملفات أدناه موجودة فعلًا داخل مجلد assets/files في المشروع — اضغط للتحميل المباشر دون أي خادم.'},
    {t:'info', title:'ملاحظة', text:'أحجام الملفات المعروضة حقيقية ومحسوبة من الملفات الفعلية في المشروع.'}
  ],
  files:[
    {name:'chatgpt-modes-cheatsheet.md', type:'MD', size:'3 KB', path:'assets/files/chatgpt-modes-cheatsheet.md'},
    {name:'code-review-prompt.txt', type:'TXT', size:'2 KB', path:'assets/files/code-review-prompt.txt'},
    {name:'arduino-blink.ino', type:'INO', size:'1 KB', path:'assets/files/arduino-blink.ino'},
    {name:'ai-tools-list.csv', type:'CSV', size:'1 KB', path:'assets/files/ai-tools-list.csv'},
    {name:'prompts-starter-pack.json', type:'JSON', size:'2 KB', path:'assets/files/prompts-starter-pack.json'}
  ]
},
{
  slug:'pcb-design-beginners', title:'دليل تصميم PCB للمبتدئين: من المخطط إلى ملفات التصنيع',
  title_en:'PCB design for beginners', description:'خطوات عملية: المخطط، اختيار البصمات، التخطيط، وقواعد DRC قبل إرسال اللوحة للمصنع.',
  description_en:'Practical steps: schematic, footprints, layout and DRC rules.',
  type:'TUTORIAL', platform:'AI Tools', category:'pcb', tags:['PCB','تصميم','هندسة','KiCad'],
  cover:'', readingTime:11, author:'Mohamed Tarek Abdelhady', date:'2026-09-02', featured:true, published:true, views:96, copies:18, downloads:0,
  prompts:[
    {id:'pcb-check', title:'برومبت مراجعة تصميم PCB', description:'قائمة فحص قبل التصنيع: كهرباء، حرارة، وقابلية اللحام.', language:'both', models:['ChatGPT','Claude'], tags:['PCB','مراجعة'],
     content:'Review my PCB design before fabrication:\n\nBoard: [size, layers, voltage, max current]\n\nCheck:\n1. Trace width vs current (IPC-2221).\n2. Decoupling capacitors near every IC power pin.\n3. Thermal reliefs on copper pours.\n4. Silkscreen overlaps and courtyard violations.\n\nOutput a checklist: PASS / FIX with exact location for each FIX.'}
  ],
  blocks:[
    {t:'p', text:'تصميم لوحة دوائر مطبوعة ناجحة يعتمد على الانضباط أكثر من الموهبة: اتبع هذه الخطوات بالترتيب ولن تتعطل لوحتك الأولى.'},
    {t:'h', text:'1. ابدأ بالمخطط النظيف'},
    {t:'list', items:['قسّم المخطط إلى كتل: تغذية، متحكم، حساسات، موصلات.','أضف مكثف فصل 100nF عند كل طرف تغذية لدوائرك المتكاملة.','سمِّ كل شبكة باسم واضح بدل الأسلاك المتقاطعة.']},
    {t:'h', text:'2. التخطيط وقواعد DRC'},
    {t:'table', head:['العنصر','القاعدة الذهبية'], rows:[['عرض المسارات','0.3mm للإشارات، و1mm لكل 1A'],['التباعد','0.2mm على الأقل بين النحاس'],['الفياز','تجنبها تحت المكونات الحساسة']]},
    {t:'warning', title:'تنبيه', text:'شغّل فحص DRC وأصلح كل الأخطاء قبل تصدير Gerber — المصنع يطبع ما ترسله حرفيًا.'},
    {t:'prompt', promptId:'pcb-check'}
  ],
  files:[]
},
{
  slug:'modern-web-basics', title:'أساسيات تطوير الويب الحديث بملفات ثابتة فقط',
  title_en:'Modern web basics with static files only', description:'ابنِ موقعًا سريعًا ومتجاوبًا بـ HTML وCSS وJavaScript فقط — بدون أطر عمل.',
  description_en:'Build a fast responsive site with HTML, CSS and vanilla JS.',
  type:'GUIDE', platform:'Multi', category:'web', tags:['ويب','HTML','CSS','JavaScript'],
  cover:'', readingTime:8, author:'Mohamed Tarek Abdelhady', date:'2026-08-28', featured:false, published:true, views:74, copies:12, downloads:0,
  prompts:[
    {id:'web-review', title:'برومبت مراجعة صفحة ويب', description:'يراجع الأداء والوصولية وSEO لصفحتك.', language:'both', models:['ChatGPT','Claude'], tags:['ويب','مراجعة'],
     content:'Review my web page for:\n1. Performance (blocking resources, image sizes, fonts).\n2. Accessibility (contrast, labels, keyboard, ARIA).\n3. SEO basics (title, meta description, headings, OG tags).\n\n[PASTE HTML HERE]\n\nGive the top 5 fixes ordered by impact, each with a code snippet.'}
  ],
  blocks:[
    {t:'p', text:'هذه المنصة نفسها (M.T.A. Lab) مبنية بهذه الطريقة: ملفات ثابتة، توجيه داخلي، وتخزين محلي — وهي أسرع من معظم مواقع أطر العمل.'},
    {t:'h', text:'القواعد الخمس'},
    {t:'list', items:['دلالات HTML أولًا: header وmain وfooter وعناوين مرتبة.','CSS بمتغيرات للألوان والمسافات لتغيير الهوية في دقائق.','JavaScript بلا مكتبات للبحث والفلاتر والتخزين.','الصور بأحجام مناسبة وLazy Loading.','اختبر على 360px قبل الشاشات الكبيرة.']},
    {t:'code', lang:'css', code:':root{\n  --color-accent:#3b82f6;\n  --space-md:1rem;\n}\n.card{\n  background:var(--color-bg-card);\n  border:1px solid var(--color-border);\n  border-radius:16px;\n}'},
    {t:'tip', title:'نصيحة', text:'ابدأ بالجوال أولًا: إذا كان الموقع مريحًا على 360px فسيكون ممتازًا على الشاشات الكبيرة.'},
    {t:'prompt', promptId:'web-review'}
  ],
  files:[]
}
];

window.DEMO_SETTINGS = {siteName:'M.T.A. Lab', siteNameAr:'M.T.A. Lab', tagline:'Articles • AI • Prompts • Knowledge', taglineAr:'مقالات تقنية • أدوات الذكاء الاصطناعي • برومبتات • المعرفة', taglineEn:'A personal collection of technical articles, AI tools, prompts, engineering workflows and practical knowledge.', adminPassword:''};
})();
