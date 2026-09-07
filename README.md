# 🚀 منصة فرصة للتوظيف الذكي - Alforsa Smart Job Aggregator

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Production-4169E1?logo=postgresql&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Development-003B57?logo=sqlite&logoColor=white)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-52B0E7?logo=sequelize&logoColor=white)
![AI-Powered](https://img.shields.io/badge/AI%20Engine-Gemini%20%2F%20Grok-FF6F00)
![Security](https://img.shields.io/badge/Security-Enterprise%20Grade-red)
![License](https://img.shields.io/badge/License-MIT-purple)

**منصة توظيف ذكية متكاملة تجمع وتحلل وتصنف الوظائف وفرص العمل الشاغرة آلياً من قنوات التليجرام والمصادر المفتوحة بالاعتماد على خوارزميات الذكاء الاصطناعي والاستخراج الآلي للمعلومات (AI OCR & Extraction).**

[نظرة عامة](#-نظرة-عامة-overview) • [الأمان وحماية البيانات](#-الأمان-وحماية-البيانات-security--protection) • [المميزات الرئيسية](#-المميزات-الرئيسية-key-features) • [محرك الذكاء الاصطناعي](#-محرك-الذكاء-الاصطناعي-والأتمتة-ai--automation) • [المعمارية البرمجية](#-الهيكلية-المعمارية-architecture) • [نماذج البيانات](#-هيكل-نماذج-البيانات-data-models) • [التشغيل المحلي](#-طريقة-التشغيل-محليا-locally)

</div>

---

## 📖 نظرة عامة (Overview)

تعتبر منصة **"فرصة"** منظومة برمجية متقدمة لحلول التوظيف الذكي في السوق المصري والعربي. تعمل المنصة كمجمّع ذكي لفرص العمل والوظائف الشاغرة؛ حيث تقوم بسحب الإعلانات المنشورة في قنوات التوظيف المختلفة، ثم تقوم بتمريرها عبر خط معالجة ذكي يعتمد على نماذج الذكاء الاصطناعي المتطورة (Vision & Text Extraction) لتحليل وتصنيف وتدقيق البيانات واستخراج المسميات الوظيفية، النطاقات الجغرافية، والرواتب، وتقديمها في واجهة موحدة، سريعة، ومريحة للباحثين عن عمل وأصحاب الشركات.

تعتمد المنصة نمط المعمارية البرمجية النظيفة **MVC (Model-View-Controller)** المعتمدة عالمياً لتوفير أعلى مستويات الأداء والمرونة وسهولة التوسع المستقبلي.

---

## 🛡️ الأمان وحماية البيانات (Security & Protection)

تم تطبيق أقوى معايير الأمان البرمجي لحماية المستخدمين والبيانات الحساسة:

* **المصادقة والتفويض متعدد المستويات (RBAC & Auth):**
  - عزل كامل بين صلاحيات الباحث عن عمل (Job Seeker)، صاحب العمل (Employer)، والمدير العام (Super Admin).
  - استخدام جلسات عمل آمنة ومحمية عبر `express-session` مع كوكيز مشفرة وخاصية `HttpOnly` و `SameSite` لمنع سرقة الجلسات.
  - دعم مسارات API المحمية عبر رموز `JSON Web Tokens (JWT)`.
* **تشفير كلمات المرور (Password Hashing):**
  - تشفير كلمات المرور باستخدام خوارزمية `bcryptjs` مع التمليح العشوائي للبيانات لمنع استرجاع أو كشف كلمات السر.
* **التحقق وتطهير المدخلات (Input Validation & Sanitization):**
  - فحص وتدقيق كافة المدخلات باستخدام مكتبة `Joi` ومطابقة القيود البرمجية لمنع هجمات حقن قواعد البيانات (SQL/NoSQL Injections) وهجمات Cross-Site Scripting (XSS).
* **سجل تدقيق ومراقبة إداري (Audit Logging):**
  - تسجيل كافة العمليات الحساسة وإجراءات المدراء (مراجعة وظيفة، تفعيل/تعطيل، حذف) مع تتبع المستخدم، الوقت، وعنوان الـ IP عبر نموذج `AuditLog`.
* **نظام كشف الوظائف الاحتيالية والرسائل المزعجة (Anti-Fraud & Deduplication):**
  - محرك ذكي يقيس معدل تشابه الوظائف (Text Similarity) لمنع تكرار الإعلانات الاحتيالية أو الوهمية وحماية الباحثين عن عمل.

---

## 🌟 المميزات الرئيسية (Key Features)

### 1. 🤖 محرك الذكاء الاصطناعي والأتمتة (AI & Automation)
* **جلب تلقائي من التليجرام (Telegram Web Scraper):** سحب ذكي للمنشورات عبر مهام مجدولة (Cron Jobs) دون الحاجة لتدخل يدوي.
* **استخراج بيانات الوظائف بالذكاء الاصطناعي (AI Data Extraction):** استخدام نماذج الذكاء الاصطناعي (Google Gemini / Grok) لتحويل نصوص وصور الإعلانات غير المهيكلة إلى بيانات دقيقة تشمل:
  - المسمى الوظيفي (Job Title) والخبرة المطلوبة.
  - الشركة / جهة العمل.
  - المحافظة والمنطقة الجغرافية (القاهرة، الجيزة، الإسكندرية...).
  - الراتب ونوع العمل (دوام كامل، جزئي، عمل عن بعد).
  - وسائل التواصل المباشرة (رقم الهاتف، الإيميل، أو رابط التقديم).
* **منع التكرار (Deduplication Engine):** خوارزمية ذكية لاكتشاف ومنع تكرار الإعلانات المشابهة التي تم سحبها سابقاً.
* **مؤشر ثقة الذكاء الاصطناعي (Confidence Score):** تقييم تلقائي لمدى دقة واكتمال بيانات كل وظيفة قبل اعتمادها.

---

### 2. 👥 نظام المستخدمين والأدوار (Multi-Role Ecosystem)
* **الباحث عن عمل (Job Seeker):**
  - محرك بحث متقدم مع فلاتر ذكية (المحافظة، التصنيف، المسمى الوظيفي، الراتب).
  - حفظ الوظائف في المفضلة (Saved Jobs) للرجوع إليها لاحقاً.
  - التقديم بنقرة واحدة عبر الواتساب أو البريد الإلكتروني أو روابط الشركات المباشرة.
  - استبيانات قياس التوظيف (Employment Outcome Surveys) لمتابعة فرص قبول المتقدمين.
* **صاحب العمل / الشركات (Employer):**
  - لوحة تحكم لنشر ومتابعة الوظائف الخاصة بالشركة.
  - استعراض عدد المشاهدات والنقرات وطلبات التقديم لكل وظيفة.
* **لوحة تحكم الإدارة العليا (Super Admin Dashboard):**
  - شاشات إحصائية ومؤشرات أداء حية (Active Jobs, Pending Reviews, Total Users).
  - خط فحص واعتماد الوظائف المستخرجة بالذكاء الاصطناعي (Moderation Pipeline).
  - سجل عمليات السحب التلقائي ومراقبة استهلاك ومعدل نجاح واجهات الـ AI (Import Logs).
  - إدارة التصنيفات، المحافظات، وقنوات التليجرام المرتبطة.

---

### 3. ⏱️ مهام المعالجة في الخلفية (Background Cron Jobs)
* **Telegram Pull Job:** سحب دوري للمنشورات ومعالجتها تلقائياً عبر نماذج الذكاء الاصطناعي.
* **Expire Jobs Job:** أرشفة وتعطيل الوظائف منتهية الصلاحية للحفاظ على دقة المنصة.
* **Outcome Survey Job:** متابعة نتائج التقديم عبر إرسال استبيانات دورية للمستخدمين.

---

## 🏛 الهيكلية المعمارية (Architecture)

```
alforsa-platform/
├── src/
│   ├── app.js                    # نقطة انطلاق الخادم وضبط الـ Middlewares
│   ├── config/                   # إعدادات قواعد البيانات والبيئة
│   ├── controllers/              # وحدات التحكم (Admin, Employer, Auth, Jobs, User)
│   ├── jobs/                     # مهام الخلفية المؤتمتة (Telegram Scraper, Cron Jobs)
│   ├── middlewares/              # طبقات التحقق والمصادقة والأمان
│   ├── models/                   # نماذج الـ ORM (Sequelize: User, Job, Category, etc.)
│   ├── routes/                   # مسارات وتوجيه الطلبات والـ RESTful APIs
│   ├── seeders/                  # البيانات الافتراضية الأولية
│   └── services/                 # خدمات الذكاء الاصطناعي (Grok/Gemini) ومعالجة النصوص
├── views/                        # واجهات العرض (EJS Pages & Partials)
│   ├── layouts/                  # القالب الأساسي للموقع (main.ejs)
│   ├── pages/                    # الصفحات الرئيسية ولوحات التحكم
│   └── partials/                 # المكونات المشتركة (Navbar, Footer, Sidebar, Modals)
├── public/                       # الملفات الثابتة (CSS, JavaScript, Images)
├── render.yaml                   # ملف الإعداد للنشر السحابي على Render
└── package.json                  # الاعتماديات وحزم المشروع
```

---

## 💻 التقنيات المستخدمة (Tech Stack)

* **البيئة البرمجية:** Node.js (v18+)
* **إطار العمل الخلفي:** Express.js
* **محرك القوالب:** EJS Templates مع `express-ejs-layouts`
* **قواعد البيانات و الـ ORM:** Sequelize مع دعم:
  - **SQLite** (للتطوير المحلي السريع والخفيف بدون متطلبات تثبيت إضافية).
  - **PostgreSQL** (للإنتاج السحابي مع دعم الفهارس المتقدمة والبحث النصي).
* **محركات الذكاء الاصطناعي:** Google Gemini 1.5 Flash API / Grok AI (مع دعم Mock Mode للتجربة دون استهلاك رصيد).
* **حزم الأمان والتحقق:**
  - `bcryptjs` لتشفير كلمات المرور.
  - `express-session` و `connect-flash` للجلسات والتنبيهات.
  - `jsonwebtoken` (JWT) للواجهات البرمجية.
  - `Joi` للتحقق من صحة المدخلات.
* **الجدولة والمهام:** `node-cron` للجدولة الزمنية و `winston` لتسجيل الأحداث (Logging).

---

## 🗄️ هيكل نماذج البيانات (Data Models)

يحتوي النظام على 18 نموذجاً برمجياً مترابطاً يغطي دورة التوظيف كاملة:

| النموذج (Model) | الوظيفة |
|---|---|
| `User` | المستخدمون (Admin, Employer, JobSeeker) مع تفاصيل الملف الشخصي |
| `Job` | بيانات الوظيفة، المتطلبات، المسمى، الراتب، ومصدر النشر |
| `Category` | التصنيفات المهنية ومجالات العمل |
| `Governorate` | المحافظات والنطاقات الجغرافية للوظائف |
| `TelegramChannel` | قنوات التليجرام المربوطة بالسحب الآلي وحالتها |
| `TelegramImport` | سجلات عمليات السحب ونتائج تحليل الذكاء الاصطناعي |
| `Application` | طلبات التقديم ومسار المتابعة من الباحث أو صاحب العمل |
| `SavedJob` / `ViewedJob` | مفضلة الوظائف وسجل التصفح |
| `EmploymentOutcome` | استبيانات قياس التوظيف ونسب نجاح المقابلات |
| `AuditLog` | سجل تدقيق ومراقبة كافة الإجراءات الإدارية في النظام |

---

## 🚀 طريقة التشغيل محلياً (Locally)

### 1. استنساخ المستودع
```bash
git clone https://github.com/kirosaid-2006/alforsa-platform.git
cd alforsa-platform
```

### 2. تثبيت الحزم
```bash
npm install
```

### 3. ضبط المتغيرات البيئية
قم بإنشاء ملف `.env` استناداً إلى `.env.example`:
```bash
cp .env.example .env
```

املأ القيم الأساسية في `.env`:
```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-secure-session-secret
JWT_SECRET=your-secure-jwt-secret

# قاعدة البيانات (SQLite للتطوير المحلي)
DB_DIALECT=sqlite
DB_STORAGE=./database/forsa.sqlite

# مفتاح الذكاء الاصطناعي (Gemini / Grok)
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MOCK_MODE=true # تفعيل وضع المحاكاة للتجربة دون استهلاك رصيد الـ API
```

### 4. تشغيل المشروع
يقوم النظام تلقائياً بإنشاء الجداول في قاعدة البيانات وزرع البيانات الافتراضية عند أول تشغيل:

```bash
# تشغيل خادم التطوير
npm run dev

# أو للتشغيل العادي
npm start
```

🌐 افتح المتصفح على: **`http://localhost:3000`**

---

## ☁️ النشر السحابي (Deployment)

المشروع مهيأ ومجهز للنشر بنقرة واحدة على منصة **Render** عبر Blueprint:
* ملف `render.yaml` يتكفل ببناء خادم Node.js مع ربط قاعدة بيانات **PostgreSQL** المدارة سحابياً وتطبيق شهادات الأمان SSL تلقائياً.

---

## 👨‍💻 المطور (Author)

* **كيرلس سعيد (Kiro Said)**
* **GitHub:** [@kirosaid-2006](https://github.com/kirosaid-2006)

---

## 📄 الترخيص (License)
هذا المشروع مرخص بموجب رخصة [MIT License](LICENSE).