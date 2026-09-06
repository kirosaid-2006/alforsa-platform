# 🚀 منصة فرصة (Alforsa Platform) — المنظومة الذكية للتوظيف وسوق العمل المصري

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-ORM-52B0E7?logo=sequelize&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Production-4169E1?logo=postgresql&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Development-003B57?logo=sqlite&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-Templates-B4CA65?logo=javascript&logoColor=white)
![AI-Powered](https://img.shields.io/badge/AI%20Engine-Gemini%20%2F%20Grok-FF6F00)

**منصة متكاملة لإدارة واستقطاب الوظائف في مصر، تجمع بين أنظمة الـ Scraping الآلي لقنوات تليجرام، وتفريغ الإعلانات وتحليلها عبر الذكاء الاصطناعي (AI OCR & Extraction)، مع لوحات تحكم متعددة الأدوار للمدراء وأصحاب الأعمال والباحثين عن عمل.**

[نظرة عامة](#-نظرة-عامة-overview) • [الميزات الرئيسية](#-الميزات-الرئيسية-key-features) • [المعمارية والتقنيات](#-المعمارية-والبنية-التقنية-architecture) • [محرك الذكاء الاصطناعي والأتمتة](#-محرك-الذكاء-الاصطناعي-والأتمتة-ai--automation) • [قاعدة البيانات](#-مخطط-قواعد-البيانات-data-models) • [التشغيل المحلي](#-دليل-التثبيت-والتشغيل-locally)

</div>

---

## 🌟 نظرة عامة (Overview)

تمثل منصة **"فرصة"** حلاً مبتكراً لمشكلة تشتت إعلانات الوظائف في مصر؛ حيث يقوم النظام بمراقبة قنوات ومجموعات التوظيف على تليجرام تلقائياً، واستخراج النصوص والصور الخاصة بالإعلانات، ثم تحليلها وفهرستها بواسطة الذكاء الاصطناعي (Vision & Text Extraction) لتحويل المنشورات العشوائية إلى فرص وظيفية منظمة ومصنفة بدقة حسب المحافظة والمهنة ومستوى الخبرة.

المشروع مصمم وفق نمط المعمارية النظيفة **MVC (Model-View-Controller)** متعدد الطبقات، مع توفير تجربة مستخدم عربية كاملة وسلسة تدعم مختلف الشاشات.

---

## ✨ الميزات الرئيسية (Key Features)

### 1. 🤖 محرك الاستيراد والتفريغ بالذكاء الاصطناعي (AI & Automation)
* **سحب تلقائي من تليجرام (Telegram Web Scraper):** مراقبة القنوات العامة المحددة عبر Cron Jobs مجدولة بدون الحاجة لـ Telegram API معقدة.
* **استخراج بيانات الوظائف (AI Data Extraction):** استخدام محركات الذكاء الاصطناعي (Google Gemini / Grok) لتحليل نص الإعلان أو قراءة صور وتصاميم الوظائف عبر الـ OCR واستخراج:
  * المسمى الوظيفي (Job Title).
  * الشركة / الجهة المعلنة.
  * المحافظة والمنطقة الجغرافية (Cairo, Giza, Alexandria...).
  * الراتب، نوع الدوام، سنوات الخبرة، وشروط الوظيفة.
  * بيانات وطرق التقديم (رقم الهاتف، واتساب، البريد، أو الرابط الخارجي).
* **كشف ومنع تكرار الوظائف (Deduplication Engine):** خوارزمية ذكية لمقارنة أرقام الهواتف، العناوين، والمحتوى لمنع تكرار الإعلانات لنفس الوظيفة من قنوات مختلفة.
* **احتساب مؤشر الثقة (Confidence Score):** منح كل وظيفة مستوردة نسبة ثقة دقيقة لمساعدة مسؤولي النظام في المراجعة السريعة.

---

### 2. 👥 نظام الأدوار والصلاحيات (Multi-Role Ecosystem)
* **الباحث عن عمل (Job Seeker):**
  * محرك بحث وفلترة ذكي ومتعدد الأبعاد (المحافظة، التصنيف، المسمى، الراتب).
  * حفظ الوظائف المفضلة (Saved Jobs) ومتابعة سجل المشاهدات.
  * التقديم على الوظائف عبر المنصة، أو التواصل السريع بنقرة واحدة عبر واتساب أو الهاتف.
  * استبيانات تقييم نتائج التوظيف (Employment Outcome Surveys) لقياس جودة الإعلانات.
* **صاحب العمل / الشركة (Employer):**
  * لوحة تحكم مخصصة لإضافة الوظائف وإدارتها.
  * استقبال السير الذاتية ومتابعة المتقدمين لكل وظيفة وتغيير حالات التقديم.
* **لوحة الإدارة المركزية (Super Admin Dashboard):**
  * مراقبة مؤشرات الأداء الحية (Active Jobs, Pending Reviews, Total Users).
  * مراجعة واعتماد الوظائف المستوردة تلقائياً (Moderation Pipeline).
  * إدارة قنوات تليجرام المستهدفة وجدولة عمليات السحب وسجلات الاستيراد (Import Logs).
  * إدارة المستخدمين، حظر الحسابات، وصلاحيات النظام التفصيلية.
  * سجل تدقيق كامل للعمليات (Audit Logs).

---

### 3. ⏰ المهام المجدولة بالخلفية (Background Cron Jobs)
* **Telegram Pull Job:** فحص دوري للقنوات وسحب الإعلانات ومعالجتها بالذكاء الاصطناعي.
* **Expire Jobs Job:** أرشفة وتعطيل الوظائف المنتهية تلقائياً بعد فترة زمنية محددة.
* **Outcome Survey Job:** إرسال تنبيهات للمتقدمين لقياس مدى نجاحهم في الحصول على الوظيفة.

---

## 🏛 المعمارية والبنية التقنية (Architecture)

```
alforsa-platform/
├── src/
│   ├── app.js                    # نقطة انطلاق السيرفر وضبط الـ Middlewares
│   ├── config/                   # إعدادات قاعدة البيانات والبيئة
│   ├── controllers/              # وحدات التحكم (Admin, Employer, Auth, Jobs, User)
│   ├── jobs/                     # المهام المجدولة بالخلفية (Telegram Scraper, Cron Jobs)
│   ├── middlewares/              # حماية المسارات والمصادقة والتحقق من الصلاحيات
│   ├── models/                   # نماذج الـ ORM (Sequelize: User, Job, Category, etc.)
│   ├── routes/                   # مسارات النظام ومسارات الـ RESTful APIs
│   ├── seeders/                  # البيانات الافتراضية الأولية (المحافظات، التصنيفات، الأدمن)
│   └── services/                 # خدمات الذكاء الاصطناعي (Grok/Gemini)، منع التكرار، والإشعارات
├── views/                        # واجهات العرض ومحرك القوالب (EJS Pages & Partials)
│   ├── layouts/                  # القالب الأساسي العام للموقع (main.ejs)
│   ├── pages/                    # صفحات المستخدمين، أصحاب الأعمال، والإدارة
│   └── partials/                 # المكونات الفرعية (Navbar, Footer, Sidebar, Modals)
├── public/                       # الأصول الثابتة (CSS, JavaScript, Images)
├── render.yaml                   # ملف إعدادات النشر السحابي التلقائي على Render
└── package.json                  # الاعتماديات والمكتبات المستخدمة
```

---

## 💻 التقنيات المستخدمة (Tech Stack)

* **بيئة التشغيل:** Node.js (v18+)
* **إطار عمل السيرفر:** Express.js
* **محرك الواجهات:** EJS Templates مع `express-ejs-layouts`
* **قواعد البيانات و ORM:** Sequelize مع دعم مزدوج:
  * **SQLite** (للتطوير المحلي السريع بدون إعدادات خادم).
  * **PostgreSQL** (للإنتاج والنشر السحابي مع دعم استعلامات الـ Text الكبيرة).
* **محركات الذكاء الاصطناعي:** Google Gemini 1.5 Flash API / Grok AI (مع وضع محاكاة Mock Mode مدمج).
* **الأمان والمصادقة:**
  * `bcryptjs` لتشفير كلمات المرور.
  * `express-session` و `connect-flash` لإدارة الجلسات والتنبيهات.
  * `jsonwebtoken` (JWT) وميدلوير تحقق الصلاحيات.
  * التحقق من البيانات عبر `Joi`.
* **المهام المجدولة والسجلات:** `node-cron` للأتمتة و `winston` للسجلات (Logging).

---

## 🗄 مخطط قواعد البيانات (Data Models)

يحتوي النظام على 18 نموذجاً علائقياً مترابطاً بدقة:

| النموذج (Model) | الوظيفة |
|---|---|
| `User` | الحسابات (Admin, Employer, JobSeeker) مع كلمات المرور المشفرة |
| `Job` | بيانات الوظيفة، الرواتب، المتطلبات، وحالة المراجعة والاعتماد |
| `Category` | تصنيفات الوظائف ومجالات العمل |
| `Governorate` | المحافظات والمناطق المصرية لتسهيل الفلترة الجغرافية |
| `TelegramChannel` | قنوات تليجرام المراقبة وإعدادات سحب البيانات لكل قناة |
| `TelegramImport` | سجلات السحب من تليجرام ونسبة ثقة الذكاء الاصطناعي |
| `Application` | طلبات التوظيف والسير الذاتية المقدمة من الباحثين عن عمل |
| `SavedJob` / `ViewedJob` | مفضلة الوظائف وسجل التصفح |
| `EmploymentOutcome` | استطلاعات نتائج التوظيف وجودة الفرص الوظيفية |
| `AuditLog` | سجل تتبع وتدقيق جميع الإجراءات الحساسة في النظام |

---

## 🛠 دليل التثبيت والتشغيل (Locally)

### 1. استنساخ المستودع
```bash
git clone https://github.com/kirosaid-2006/alforsa-platform.git
cd alforsa-platform
```

### 2. تثبيت الحزم
```bash
npm install
```

### 3. إعداد المتغيرات البيئية
قم بإنشاء ملف `.env` استناداً إلى `.env.example`:
```bash
cp .env.example .env
```

محتوى ملف `.env` النموذجي:
```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-secure-session-secret
JWT_SECRET=your-secure-jwt-secret

# قاعدة البيانات (افتراضياً SQLite لتشغيل فوري)
DB_DIALECT=sqlite
DB_STORAGE=./database/forsa.sqlite

# محرك الذكاء الاصطناعي (Gemini / Grok)
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MOCK_MODE=true # اجعلها true لتجربة المنصة محلياً بدون استهلاك رصيد الـ API
```

### 4. تهيئة البيانات وبدء التشغيل
النظام يقوم تلقائياً بمزامنة الجداول وتشغيل الـ Seeders لملء المحافظات والتصنيفات عند أول تشغيل:

```bash
# تشغيل خادم التطوير
npm run dev

# أو التشغيل العادي
npm start
```

افتح المتصفح وتوجه إلى:
👉 **`http://localhost:3000`**

---

## 🚢 النشر السحابي (Deployment)

المشروع مهيأ ومعد مسبقاً للنشر بنقرة واحدة عبر **Render Blueprint**:
* ملف `render.yaml` جاهز لربط سيرفر Node.js بخادم قاعدة بيانات **PostgreSQL** تلقائياً.
* يدعم الـ Reverse Proxies وتوليد شهادات الحماية SSL بشكل كامل.

---

## 👨‍💻 المطور (Author)

* **كيرلس سعيد (Kiro Said)**
* **GitHub:** [@kirosaid-2006](https://github.com/kirosaid-2006)