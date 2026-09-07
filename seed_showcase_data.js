const { 
  sequelize, 
  Role, 
  Category, 
  Governorate, 
  User, 
  Job, 
  Application, 
  EmploymentOutcome, 
  JobContactUnlock, 
  SavedJob, 
  ViewedJob, 
  Report, 
  Notification, 
  TelegramChannel, 
  TelegramImport 
} = require('./src/models');

const runSeeders = require('./src/seeders');

async function seedShowcase() {
  try {
    console.log('🔄 التأكد من مزامنة قاعدة البيانات وتشغيل البذور الأساسية...');
    await sequelize.sync({ force: false });
    await runSeeders(false);

    // Fetch Roles
    const superAdminRole = await Role.findOne({ where: { name: 'super_admin' } });
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    const employerRole = await Role.findOne({ where: { name: 'employer' } });
    const userRole = await Role.findOne({ where: { name: 'user' } });

    // Fetch Categories
    const catIT = await Category.findOne({ where: { slug: 'it-software' } });
    const catSales = await Category.findOne({ where: { slug: 'sales' } });
    const catCS = await Category.findOne({ where: { slug: 'customer-service' } });
    const catFinance = await Category.findOne({ where: { slug: 'accounting-finance' } });
    const catEng = await Category.findOne({ where: { slug: 'engineering' } });
    const catDrivers = await Category.findOne({ where: { slug: 'drivers' } });
    const catTech = await Category.findOne({ where: { slug: 'technicians-craftsmen' } });
    const catLabor = await Category.findOne({ where: { slug: 'manual-labor' } });
    const catSecurity = await Category.findOne({ where: { slug: 'security' } });
    const catMedical = await Category.findOne({ where: { slug: 'medical-pharma' } });
    const catHospitality = await Category.findOne({ where: { slug: 'hospitality-food' } });
    const catHR = await Category.findOne({ where: { slug: 'management-hr' } });
    const catMarketing = await Category.findOne({ where: { slug: 'marketing-advertising' } });

    // Fetch Governorates
    const govCairo = await Governorate.findOne({ where: { slug: 'cairo' } });
    const govGiza = await Governorate.findOne({ where: { slug: 'giza' } });
    const govAlex = await Governorate.findOne({ where: { slug: 'alexandria' } });
    const govDakahlia = await Governorate.findOne({ where: { slug: 'dakahlia' } });
    const govSharqia = await Governorate.findOne({ where: { slug: 'sharqia' } });
    const govGharbia = await Governorate.findOne({ where: { slug: 'gharbia' } });
    const govQalyubia = await Governorate.findOne({ where: { slug: 'qalyubia' } });

    console.log('👤 إنشاء أو تحديث المستخدمين (المدراء، أصحاب الأعمال، الباحثين عن عمل)...');

    // 1. Admin
    let [adminUser] = await User.findOrCreate({
      where: { phone: '01000000000' },
      defaults: {
        full_name: 'مدير منصة فرصة',
        email: 'admin@forsa.com',
        phone: '01000000000',
        whatsapp_phone: '01000000000',
        password_hash: '123456',
        birth_date: '1988-05-15',
        gender: 'male',
        governorate_id: govCairo.id,
        city: 'القاهرة الجديدة',
        national_id: '28805150101234',
        qualification: 'bachelors',
        employment_status: 'employed',
        experience_level: 'more_than_5',
        role_id: superAdminRole.id,
        consent_save_data: true,
        consent_disclaimer: true,
        consent_notifications: true
      }
    });

    // 2. Employers
    let [employerTech] = await User.findOrCreate({
      where: { phone: '01011111111' },
      defaults: {
        full_name: 'شركة النيل للحلول التقنية (HR)',
        email: 'hr@nile-tech.com',
        phone: '01011111111',
        whatsapp_phone: '01011111111',
        password_hash: '123456',
        birth_date: '1985-02-10',
        gender: 'male',
        governorate_id: govCairo.id,
        city: 'المعادي',
        national_id: '28502100101234',
        qualification: 'bachelors',
        employment_status: 'employed',
        experience_level: 'more_than_5',
        role_id: employerRole.id,
        consent_save_data: true,
        consent_disclaimer: true,
        consent_notifications: true
      }
    });

    let [employerAraby] = await User.findOrCreate({
      where: { phone: '01022222222' },
      defaults: {
        full_name: 'مجموعة العربي للتجارة والصناعة (HR)',
        email: 'careers@elarabygroup.com',
        phone: '01022222222',
        whatsapp_phone: '01022222222',
        password_hash: '123456',
        birth_date: '1982-11-20',
        gender: 'male',
        governorate_id: govGiza.id,
        city: 'الدقي',
        national_id: '28211200101234',
        qualification: 'bachelors',
        employment_status: 'employed',
        experience_level: 'more_than_5',
        role_id: employerRole.id,
        consent_save_data: true,
        consent_disclaimer: true,
        consent_notifications: true
      }
    });

    let [employerLogistics] = await User.findOrCreate({
      where: { phone: '01033333333' },
      defaults: {
        full_name: 'المصرية للشحن واللوجستيات',
        email: 'hr@egy-logistics.com',
        phone: '01033333333',
        whatsapp_phone: '01033333333',
        password_hash: '123456',
        birth_date: '1990-07-07',
        gender: 'male',
        governorate_id: govQalyubia.id,
        city: 'قليوب',
        national_id: '29007070101234',
        qualification: 'bachelors',
        employment_status: 'employed',
        experience_level: 'more_than_5',
        role_id: employerRole.id,
        consent_save_data: true,
        consent_disclaimer: true,
        consent_notifications: true
      }
    });

    // 3. Job Seekers
    let [seekerAhmed] = await User.findOrCreate({
      where: { phone: '01044444444' },
      defaults: {
        full_name: 'أحمد علي محمود',
        email: 'ahmed.ali@gmail.com',
        phone: '01044444444',
        whatsapp_phone: '01044444444',
        password_hash: '123456',
        birth_date: '1997-04-12',
        gender: 'male',
        governorate_id: govCairo.id,
        city: 'مدينة نصر',
        national_id: '29704120101234',
        qualification: 'bachelors',
        college_institute: 'كلية الحاسبات والمعلومات',
        graduation_year: 2019,
        employment_status: 'seeking',
        experience_level: '3_5_years',
        role_id: userRole.id,
        consent_save_data: true,
        consent_disclaimer: true,
        consent_notifications: true
      }
    });

    let [seekerSara] = await User.findOrCreate({
      where: { phone: '01055555555' },
      defaults: {
        full_name: 'سارة حسن إبراهيم',
        email: 'sara.hassan@gmail.com',
        phone: '01055555555',
        whatsapp_phone: '01055555555',
        password_hash: '123456',
        birth_date: '1999-09-25',
        gender: 'female',
        governorate_id: govAlex.id,
        city: 'سموحة',
        national_id: '29909250101234',
        qualification: 'bachelors',
        college_institute: 'كلية التجارة وإدارة الأعمال',
        graduation_year: 2021,
        employment_status: 'seeking',
        experience_level: '1_3_years',
        role_id: userRole.id,
        consent_save_data: true,
        consent_disclaimer: true,
        consent_notifications: true
      }
    });

    let [seekerMohamed] = await User.findOrCreate({
      where: { phone: '01066666666' },
      defaults: {
        full_name: 'محمد سيد عبد الرحمن',
        email: 'mohamed.sayed@gmail.com',
        phone: '01066666666',
        whatsapp_phone: '01066666666',
        password_hash: '123456',
        birth_date: '1995-01-30',
        gender: 'male',
        governorate_id: govSharqia.id,
        city: 'العاشر من رمضان',
        national_id: '29501300101234',
        qualification: 'diploma',
        college_institute: 'دبلوم صنايع قسم كهرباء',
        graduation_year: 2014,
        employment_status: 'seeking',
        experience_level: 'more_than_5',
        role_id: userRole.id,
        consent_save_data: true,
        consent_disclaimer: true,
        consent_notifications: true
      }
    });

    let [seekerKhaled] = await User.findOrCreate({
      where: { phone: '01077777777' },
      defaults: {
        full_name: 'خالد عمر مصطفى',
        email: 'khaled.omar@gmail.com',
        phone: '01077777777',
        whatsapp_phone: '01077777777',
        password_hash: '123456',
        birth_date: '1993-08-14',
        gender: 'male',
        governorate_id: govGiza.id,
        city: 'فيصل',
        national_id: '29308140101234',
        qualification: 'none',
        employment_status: 'seeking',
        experience_level: 'none',
        role_id: userRole.id,
        consent_save_data: true,
        consent_disclaimer: true,
        consent_notifications: true
      }
    });

    console.log('📋 إضافة الوظائف النموذجية المتنوعة...');

    const jobsData = [
      {
        title: 'مطور برمجيات Full Stack (Node.js & React)',
        slug: 'fullstack-nodejs-react-niletech',
        description: `تعلن شركة النيل للحلول التقنية عن حاجتها لمطور برمجيات خبير في تقنيات Node.js و React للانضمام إلى فريق العمل في مقر الشركة بالمعادي أو بنظام العمل الهجين.
ستعمل على تطوير وإدارة منصات إلكترونية واسعة النطاق وقواعد بيانات سريعة مع فرق متعددة التخصصات.`,
        requirements: `- خبرة عملية لا تقل عن 3 سنوات في JavaScript / TypeScript.
- إتقان تام لـ Express.js، Sequelize/TypeORM، و PostgreSQL.
- إجادة React.js و Next.js و State Management (Redux/Zustand).
- فهم عميق لبناء RESTful APIs ومعايير الأمان وتوثيق Swagger.
- إتقان استخدام Git و Docker.`,
        benefits: `- راتب تنافسي يبدأ من 18,000 إلى 25,000 جنيه مصري.
- تأمين طبي شامل (عائلي) وتأمين اجتماعي.
- نظام عمل هجين (يومان من المقر و3 أيام من المنزل).
- دورات تدريبية متخصصة وميزانية تعلم سنوية.
- بيئة عمل مرنة ومحفزة على الابتكار.`,
        company_name: 'شركة النيل للحلول التقنية',
        company_website: 'https://nile-tech.com',
        category_id: catIT.id,
        governorate_id: govCairo.id,
        city: 'المعادي - القاهرة',
        qualification: 'bachelors',
        min_experience_years: 3,
        working_hours: 'دوام كامل (9 صباحاً إلى 5 مساءً)',
        salary_min: 18000,
        salary_max: 25000,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['Node.js', 'React.js', 'PostgreSQL', 'Docker', 'REST API'],
        status: 'published',
        posted_by: employerTech.id,
        approved_by: adminUser.id,
        approved_at: new Date(Date.now() - 2 * 86400000),
        published_at: new Date(Date.now() - 2 * 86400000),
        views_count: 142,
        applications_count: 8,
        contact_phone: '01011111111',
        contact_whatsapp: '01011111111',
        contact_email: 'careers@nile-tech.com',
        contact_info: 'المعادي، شارع اللاسلكي، مبنى 4، الدور الثالث',
        source: 'web',
        is_featured: true,
        is_urgent: true
      },
      {
        title: 'مسؤول مبيعات خارجية B2B للشركات والمصانع',
        slug: 'b2b-sales-representative-elaraby',
        description: `مطلوب فوراً مسؤول مبيعات خارجية للعمل بقطاع توريدات الشركات والمؤسسات بمجموعة العربي.
المهام الرئيسية تشمل فتح أسواق جديدة، والتواصل مع مسؤولي المشتريات بالشركات الكبرى، وإبرام عقود التوريد السنوية.`,
        requirements: `- مؤهل عالي مناسب (يفضل خريجي تجارة أو إدارة أعمال).
- خبرة لا تقل عن سنتين في مبيعات الـ B2B للشركات.
- مهارات اتصال وتفاوض استثنائية وإقناع رفيع المستوى.
- امتلاك سيارة خاصة ميزة إضافية (يوجد بدل انتقال).
- حسن المظهر واللباقة في التعامل.`,
        benefits: `- راتب ثابت يبدأ من 9,000 حتى 13,000 ج.م + عمولات بيع شهرية مجزية.
- بدل وقود وانتقالات، وبدل هاتف ومكالمات.
- تأمين صحي وتأمينات اجتماعية وصندوق زمالة.
- فرص ترقية سريعة للإشراف وإدارة المناطق البيعية.`,
        company_name: 'مجموعة العربي للصناعات والتجارة',
        company_website: 'https://elarabygroup.com',
        category_id: catSales.id,
        governorate_id: govGiza.id,
        city: 'الدقي / المهندسين',
        qualification: 'bachelors',
        min_experience_years: 2,
        working_hours: 'دوام كامل (8:30 ص إلى 4:30 م)',
        salary_min: 9000,
        salary_max: 13000,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['B2B Sales', 'Negotiation', 'CRM', 'Communication'],
        status: 'published',
        posted_by: employerAraby.id,
        approved_by: adminUser.id,
        approved_at: new Date(Date.now() - 3 * 86400000),
        published_at: new Date(Date.now() - 3 * 86400000),
        views_count: 98,
        applications_count: 5,
        contact_phone: '01022222222',
        contact_whatsapp: '01022222222',
        contact_email: 'jobs@elarabygroup.com',
        contact_info: 'فرع الدقي، شارع مصدق، برج التجارة',
        source: 'web',
        is_featured: true,
        is_urgent: false
      },
      {
        title: 'ممثل خدمة عملاء ودعم فني (عربي / إنجليزي)',
        slug: 'customer-service-rep-alex-callcenter',
        description: `تطلب كبرى مراكز الاتصالات في الإسكندرية ممثلي خدمة عملاء لتلقي مكالمات واستفسارات العملاء وحل المشكلات الفنية. نرحب بحديثي التخرج وبدون خبرة سابقة مع توفير تدريب مدفوع الأجر.`,
        requirements: `- مؤهل فوق متوسط أو عالي (معهد أو كلية).
- لا يشترط وجود خبرة سابقة (متاح لحديثي التخرج).
- مستوى لغة إنجليزية متوسط أو جيد.
- مهارات استماع ممتازة وصبر وقدرة على حل النزاعات.
- إجادة التعامل مع الحاسب الآلي وسرعة الكتابة على لوحة المفاتيح.`,
        benefits: `- راتب مجزي يتراوح بين 6,500 إلى 8,500 جنيه.
- بونص شهري مرتبط بجودة المكالمات وتقييم العملاء (KPIs).
- خطوط مواصلات لجميع أنحاء الإسكندرية ذهاباً وعودة.
- تأمين صحي شامل وتأمينات اجتماعية من اليوم الأول.
- أسبوع تدريب مدفوع الأجر بالكامل.`,
        company_name: 'جلوبال كونتكت سنتر',
        company_website: 'https://globalcontact.example.com',
        category_id: catCS.id,
        governorate_id: govAlex.id,
        city: 'سموحة - الإسكندرية',
        qualification: 'institute',
        min_experience_years: 0,
        working_hours: 'ورديات متغيرة (8 ساعات يومياً - يومين إجازة)',
        salary_min: 6500,
        salary_max: 8500,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['Customer Service', 'Call Handling', 'English', 'Problem Solving'],
        status: 'published',
        posted_by: employerTech.id,
        approved_by: adminUser.id,
        approved_at: new Date(Date.now() - 1 * 86400000),
        published_at: new Date(Date.now() - 1 * 86400000),
        views_count: 215,
        applications_count: 14,
        contact_phone: '01234567890',
        contact_whatsapp: '01234567890',
        contact_email: 'recruitment@alex-cs.com',
        contact_info: 'سموحة، أمام نادي سموحة، مجمع الأعمال',
        source: 'web',
        is_featured: false,
        is_urgent: true
      },
      {
        title: 'محاسب عام ومراجعة مالية خريج تجارة',
        slug: 'general-accountant-delta-mansoura',
        description: `مطلوب محاسب عام لشركة الدلتا للاستثمار الزراعي والصناعي بالمنصورة لمسك الدفاتر وإعداد القيود المحاسبية، ومطابقة كشوف الحسابات البنكية وحسابات الموردين والعملاء، والإقرار الضريبي.`,
        requirements: `- بكالوريوس تجارة شعبة محاسبة (تقدير جيد على الأقل).
- خبرة من سنتين إلى 4 سنوات في المحاسبة المالية.
- إتقان العمل على برامج المحاسبة (ERP / Odoo / Excel المتقدم).
- دراية بالقوانين الضريبية المصرية ومنظومة الفاتورة الإلكترونية.`,
        benefits: `- راتب ممتاز من 8,000 إلى 11,000 ج.م حسب الخبرة.
- مكافآت سنوية وأرباح دورية.
- تأمين صحي خاص واجتماعي.
- بيئة عمل احترافية ومستقرة.`,
        company_name: 'شركة الدلتا للاستثمار الزراعي',
        company_website: 'https://delta-agri.example.com',
        category_id: catFinance.id,
        governorate_id: govDakahlia.id,
        city: 'المنصورة',
        qualification: 'bachelors',
        min_experience_years: 2,
        working_hours: 'من 9 ص حتى 5 م (الجمعة والسبت إجازة)',
        salary_min: 8000,
        salary_max: 11000,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['Excel', 'Odoo', 'Tax Returns', 'Financial Auditing'],
        status: 'published',
        posted_by: employerAraby.id,
        approved_by: adminUser.id,
        approved_at: new Date(Date.now() - 4 * 86400000),
        published_at: new Date(Date.now() - 4 * 86400000),
        views_count: 110,
        applications_count: 6,
        contact_phone: '01122334455',
        contact_whatsapp: '01122334455',
        contact_email: 'finance@delta-agri.com',
        contact_info: 'المنصورة، شارع المشاية السفلية، برج الصفوة',
        source: 'web',
        is_featured: false,
        is_urgent: false
      },
      {
        title: 'فني كهرباء صيانة وتحكم آلي (PLC & Classic Control)',
        slug: 'plc-electrical-technician-10th-ramadan',
        description: `مطلوب فوراً فنيين صيانة كهربائية للعمل بخطوط إنتاج بمصانع الأجهزة المنزلية بالعاشر من رمضان. التعامل مع دوائر الكنترول والإنفرتر وشاشات التحكم وصيانة الأعطال الطارئة.`,
        requirements: `- دبلوم صناعي قسم كهرباء قوى أو معهد فني صناعي.
- خبرة لا تقل عن 3 سنوات بالمصانع وخطوط الإنتاج.
- فهم قراءة المخططات والدوائر الكهربائية وتتبع الأعطال.
- الاستعداد للعمل بنظام الورديات.`,
        benefits: `- راتب أساسي من 7,500 إلى 10,500 ج.م + حوافز إنتاج.
- توفير وجبة يومية ومواصلات تغطي الشرقية والقاهرة والقليوبية.
- تأمين صحي واجتماعي ومنح في الأعياد والمناسبات.
- سكن مجهز ومكيف للمغتربين مجاناً.`,
        company_name: 'الأهرام للصناعات الكهربائية',
        company_website: 'https://ahram-electric.example.com',
        category_id: catTech.id,
        governorate_id: govSharqia.id,
        city: 'مدينة العاشر من رمضان',
        qualification: 'diploma',
        min_experience_years: 3,
        working_hours: 'ورديات 8 ساعات (أسبوع صباحي وأسبوع مسائي)',
        salary_min: 7500,
        salary_max: 10500,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['PLC', 'Classic Control', 'Inverters', 'Industrial Maintenance'],
        status: 'published',
        posted_by: employerAraby.id,
        approved_by: adminUser.id,
        approved_at: new Date(Date.now() - 5 * 86400000),
        published_at: new Date(Date.now() - 5 * 86400000),
        views_count: 180,
        applications_count: 9,
        contact_phone: '01099887766',
        contact_whatsapp: '01099887766',
        contact_email: 'factory-jobs@ahram-electric.com',
        contact_info: 'العاشر من رمضان، المنطقة الصناعية الثالثة B4',
        source: 'web',
        is_featured: true,
        is_urgent: true
      },
      {
        title: 'سائقين درجة ثانية وأولى (شاحنات وتوزيع)',
        slug: 'drivers-logistics-qalyubia',
        description: `تطلب الشركة المصرية للخدمات اللوجستية والشحن سائقين رخصة مهنية (درجة أولى أو ثانية) لتوزيع الشحنات والبضائع بين الفروع والمستودعات في محافظات الدلتا والقاهرة الكبرى.`,
        requirements: `- رخصة قيادة مهنية سارية (أولى أو ثانية).
- مؤهل متوسط (دبلوم) مع إجادة القراءة والكتابة.
- الالتزام بقواعد المرور وسلامة المنقولات والمركبة.
- أداء الخدمة العسكرية أو الإعفاء منها.
- فيش جنائي ساري وخالي من أي سوابق.`,
        benefits: `- راتب شهري ثابت من 6,500 إلى 8,000 ج.م + بدلات سفر يومية.
- تأمين اجتماعي وتأمين صحي وبوليصة تأمين على الحياة.
- سيارات نقل حديثة ومكيفة.
- مكافآت للمحافظة على صيانة السيارة وسلامتها.`,
        company_name: 'المصرية للخدمات اللوجستية والشحن',
        company_website: 'https://egy-logistics.com',
        category_id: catDrivers.id,
        governorate_id: govQalyubia.id,
        city: 'بنها / قليوب',
        qualification: 'diploma',
        min_experience_years: 2,
        working_hours: 'دوام كامل (رحلات توزيع مجدولة)',
        salary_min: 6500,
        salary_max: 8000,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['قيادة شاحنات', 'رخصة مهنية', 'معرفة الطرق السريعة'],
        status: 'published',
        posted_by: employerLogistics.id,
        approved_by: adminUser.id,
        approved_at: new Date(Date.now() - 3 * 86400000),
        published_at: new Date(Date.now() - 3 * 86400000),
        views_count: 165,
        applications_count: 11,
        contact_phone: '01033333333',
        contact_whatsapp: '01033333333',
        contact_email: 'drivers@egy-logistics.com',
        contact_info: 'طريق مصر إسكندرية الزراعي، مجمع المخازن المركزي',
        source: 'web',
        is_featured: false,
        is_urgent: false
      },
      {
        title: 'عمال إنتاج وتعبئة وتغليف (بدون شهادة / سكن ومواصلات)',
        slug: 'packaging-production-workers-6october',
        description: `فرص عمل للشباب بمصانع المواد الغذائية الكبرى بمدينة 6 أكتوبر. العمل على خطوط التعبئة والتغليف الجاهزة بدون اشتراط أي شهادة أو خبرة سابقة. المقابلة والتعيين فوري.`,
        requirements: `- السن من 18 إلى 45 سنة.
- لا يشترط مؤهل نهائياً (نقبل بدون مؤهل وجميع الشهادات).
- التفرغ والالتزام بمواعيد الوردية.
- موقف واضح من التجنيد.`,
        benefits: `- راتب شهري 5,500 إلى 7,200 جنيه مصري (حسب عدد ساعات العمل والإضافي).
- سكن للمغتربين مجهز مجاناً داخل مجمع سكني.
- مواصلات مجانية ذهاب وعودة لجميع محطات الجيزة والقاهرة.
- وجبة ساخنة يومية أثناء الوردية.
- سلف أسبوعية بعد أول أسبوع عمل.`,
        company_name: 'إيجيبت فودز للصناعات الغذائية',
        company_website: '',
        category_id: catLabor.id,
        governorate_id: govGiza.id,
        city: 'مدينة 6 أكتوبر',
        qualification: 'none',
        min_experience_years: 0,
        working_hours: '12 ساعة (شامل فترات راحة ووجبة) - ورديات متغيرة',
        salary_min: 5500,
        salary_max: 7200,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['تعبئة وتغليف', 'نشاط بدني', 'التزام بالمواعيد'],
        status: 'published',
        posted_by: employerAraby.id,
        approved_by: adminUser.id,
        approved_at: new Date(Date.now() - 6 * 86400000),
        published_at: new Date(Date.now() - 6 * 86400000),
        views_count: 310,
        applications_count: 22,
        contact_phone: '01500112233',
        contact_whatsapp: '01500112233',
        contact_email: 'jobs@egyptfoods.example.com',
        contact_info: 'المنطقة الصناعية الرابعة، أمام مصانع الألبان، أكتوبر',
        source: 'web',
        is_featured: true,
        is_urgent: true
      },
      {
        title: 'أفراد أمن إداري بمول تجاري وكبرى الشركات',
        slug: 'security-guards-tagamoa-malls',
        description: `مطلوب فوراً أفراد أمن وحراسة للعمل بمول تجاري شهير بالتجمع الخامس. الحفاظ على النظام، متابعة كاميرات المراقبة بالبوابات، وإرشاد رواد المول.`,
        requirements: `- مؤهل متوسط أو دبلوم فني.
- الطول لا يقل عن 175 سم وجسم متناسق ومظهر لائق.
- السن من 21 إلى 40 عاماً.
- التفرغ والانضباط العالي.`,
        benefits: `- راتب 5,500 إلى 6,800 ج.م شهرياً.
- زي موحد صيفي وشتوي مجاناً.
- سكن للمغتربين ومواصلات داخلية.
- تأمينات اجتماعية وصحية وزيادات سنوية منتظمة.`,
        company_name: 'النسر للحراسات والأمن الإداري',
        company_website: 'https://eagle-security.example.com',
        category_id: catSecurity.id,
        governorate_id: govCairo.id,
        city: 'التجمع الخامس - القاهرة الجديدة',
        qualification: 'diploma',
        min_experience_years: 0,
        working_hours: 'وردية 8 ساعات أو 12 ساعة (اختياري)',
        salary_min: 5500,
        salary_max: 6800,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['حراسة وأمن', 'مراقبة بوابات', 'لياقة بدنية'],
        status: 'published',
        posted_by: employerLogistics.id,
        approved_by: adminUser.id,
        approved_at: new Date(Date.now() - 1 * 86400000),
        published_at: new Date(Date.now() - 1 * 86400000),
        views_count: 140,
        applications_count: 7,
        contact_phone: '01299881122',
        contact_whatsapp: '01299881122',
        contact_email: 'security@eagle-guard.com',
        contact_info: 'التجمع الخامس، شارع التسعين الشمالي، بجوار مول أوبن إير',
        source: 'web',
        is_featured: false,
        is_urgent: false
      },
      {
        title: 'صيدلي ومساعد صيدلي (شيفت مسائي وصباحي)',
        slug: 'pharmacist-shefaa-tanta',
        description: `سلسلة صيدليات الشفاء بطنطا تعلن عن فتح باب التعيين لصيادلة ومساعدي صيادلة للعمل بالصيدلية في صرف الروشتات الطبية وتقديم المشورة الدوائية للجمهور وجرد النواقص.`,
        requirements: `- بكالوريوس صيدلة (للصيدلي) مع كارنيه نقابة وساري.
- مؤهل عالي أو متوسط مع خبرة لا تقل عن سنة (لمساعد الصيدلي).
- إجادة استخدام برامج إدارة الصيدليات (داتا بلاس / سمارت).
- مهارة في البيع واقتراح البدائل واللباقة.`,
        benefits: `- راتب مجزي من 7,000 إلى 10,000 ج.م + نسبة على مبيعات اللستة والمستحضرات.
- بيئة عمل طبية راقية ومجهزة بالكامل.
- مرونة في تنظيم الشفتات الصباحية والمسائية.
- فرص تدريب مستمرة في الفارماكولوجي والتجميل.`,
        company_name: 'صيدليات الشفاء الكبرى',
        company_website: '',
        category_id: catMedical.id,
        governorate_id: govGharbia.id,
        city: 'طنطا',
        qualification: 'bachelors',
        min_experience_years: 1,
        working_hours: '8 ساعات (شفت مسائي أو صباحي)',
        salary_min: 7000,
        salary_max: 10000,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['صيدلة إكلينيكية', 'برامج صيدليات', 'فارماكولوجي'],
        status: 'published',
        posted_by: employerTech.id,
        approved_by: adminUser.id,
        approved_at: new Date(Date.now() - 2 * 86400000),
        published_at: new Date(Date.now() - 2 * 86400000),
        views_count: 88,
        applications_count: 4,
        contact_phone: '01055667788',
        contact_whatsapp: '01055667788',
        contact_email: 'jobs@shefaa-pharma.com',
        contact_info: 'طنطا، شارع البحر الرئيسي، برج المحطة',
        source: 'web',
        is_featured: false,
        is_urgent: false
      },
      {
        title: 'مهندس مدني موقع وتنفيذ مشاريع معمارية',
        slug: 'civil-site-engineer-new-capital',
        description: `مطلوب مهندس مدني موقع للعمل بمشروع كمبوند سكني بالعاصمة الإدارية الجديدة لمتابعة استلام أعمال الخرسانات والتشطيبات ومراجعة المقايسات مع الاستشاري.`,
        requirements: `- بكالوريوس هندسة مدنية من جامعة معتمدة.
- خبرة لا تقل عن 4 سنوات بأعمال الموقع والخرسانات والتشطيبات.
- إتقان البرامج الهندسية: AutoCAD, Primavera, MS Office.
- دقة عالية في حصر الكميات والمطابقة المعمارية والإنشائية.`,
        benefits: `- راتب شهري يبدأ من 15,000 إلى 22,000 جنيه مصري.
- سيارة موقع وبدل انتقال وبدل هاتف.
- تأمين صحي عائلي خاص وتأمين اجتماعي.
- مكافآت إنجاز عند تسليم المراحل قبل الجداول الزمنية.`,
        company_name: 'النصر للإنشاءات الهندسية والمقاولات',
        company_website: 'https://al-nasr-constructions.example.com',
        category_id: catEng.id,
        governorate_id: govCairo.id,
        city: 'العاصمة الإدارية الجديدة',
        qualification: 'bachelors',
        min_experience_years: 4,
        working_hours: '8:30 ص إلى 4:30 م (الجمعة إجازة)',
        salary_min: 15000,
        salary_max: 22000,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['Civil Engineering', 'AutoCAD', 'Site Execution', 'Quantity Survey'],
        status: 'published',
        posted_by: employerLogistics.id,
        approved_by: adminUser.id,
        approved_at: new Date(Date.now() - 7 * 86400000),
        published_at: new Date(Date.now() - 7 * 86400000),
        views_count: 230,
        applications_count: 12,
        contact_phone: '01088776655',
        contact_whatsapp: '01088776655',
        contact_email: 'engineering@alnasr-builders.com',
        contact_info: 'العاصمة الإدارية، الحي المالي، مجمع البنوك',
        source: 'web',
        is_featured: true,
        is_urgent: false
      },
      {
        title: 'كابتن صالة وشيف بيتزا ومخبوزات إيطالية',
        slug: 'restaurant-captain-chef-stanley',
        description: `تعلن سلسلة مطاعم فورنو الإيطالية الشهيرة في الإسكندرية عن طلب كابتن صالة وطاقم ويترات بالإضافة إلى شيف مختص في تحضير البيتزا والباستا.`,
        requirements: `- مؤهل متوسط أو فوق متوسط (يفضل خريجي سياحة وفنادق).
- خبرة سنة على الأقل بالمطاعم والكافيهات الراقية.
- سرعة البديهة واللباقة والابتسامة في التعامل مع الزبائن.
- الالتزام التام بمعايير النظافة والصحة والسلامة الغذائية.`,
        benefits: `- راتب أساسي 6,000 إلى 8,000 ج.م + تبس يومي ونسبة أرباح شهرية.
- وجبة يومية من قائمة المطعم.
- تأمين اجتماعي وصحي وزي عمل موحد.
- بيئة عمل حيوية على كورنيش الإسكندرية.`,
        company_name: 'مطاعم فورنو الإيطالية',
        company_website: '',
        category_id: catHospitality.id,
        governorate_id: govAlex.id,
        city: 'ستانلي - الإسكندرية',
        qualification: 'diploma',
        min_experience_years: 1,
        working_hours: '8 ساعات يومياً بنظام الورديات',
        salary_min: 6000,
        salary_max: 8000,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['خدمة مطاعم', 'ضيافة وفنادق', 'إعداد وجبات', 'لباقة'],
        status: 'published',
        posted_by: employerTech.id,
        approved_by: adminUser.id,
        approved_at: new Date(Date.now() - 1 * 86400000),
        published_at: new Date(Date.now() - 1 * 86400000),
        views_count: 75,
        applications_count: 3,
        contact_phone: '01211223344',
        contact_whatsapp: '01211223344',
        contact_email: 'careers@forno-egypt.com',
        contact_info: 'كورنيش الإسكندرية، كوبري ستانلي',
        source: 'web',
        is_featured: false,
        is_urgent: false
      },
      {
        title: 'أخصائي موارد بشرية واستقطاب مواهب (HR Recruiter)',
        slug: 'hr-recruiter-talent-acquisition-giza',
        description: `مطلوب أخصائي موارد بشرية متخصص في التوظيف واستقطاب الكفاءات (Talent Acquisition) لإدارة دورة التوظيف الكاملة من نشر الإعلانات ومطابقة السير الذاتية وعقد المقابلات الشخصية وتأهيل الموظفين الجدد.`,
        requirements: `- بكالوريوس مناسب (إدارة أعمال أو ما يعادلها).
- خبرة سنتين في التوظيف والمقابلات وإدارة قنوات السوشيال ميديا المهنية.
- إجادة تامة للغة الإنجليزية وبرامج مايكروسوفت أوفيس.
- مهارات تواصل وبناء علاقات ممتازة.`,
        benefits: `- راتب يبدأ من 9,000 إلى 14,000 ج.م وفق الخبرة.
- يومين إجازة أسبوعياً (الجمعة والسبت).
- تأمين صحي خاص واجتماعي.
- فرصة للتطور المهني والترقي السريع لإدارة قسم التوظيف.`,
        company_name: 'بيراميدز للاستشارات وتطوير الأعمال',
        company_website: 'https://pyramids-consulting.example.com',
        category_id: catHR.id,
        governorate_id: govGiza.id,
        city: 'المهندسين - الجيزة',
        qualification: 'bachelors',
        min_experience_years: 2,
        working_hours: 'من 9 صباحاً إلى 5 مساءً',
        salary_min: 9000,
        salary_max: 14000,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['HR', 'Talent Acquisition', 'Interviewing', 'Job Posting'],
        status: 'published',
        posted_by: employerAraby.id,
        approved_by: adminUser.id,
        approved_at: new Date(Date.now() - 4 * 86400000),
        published_at: new Date(Date.now() - 4 * 86400000),
        views_count: 105,
        applications_count: 5,
        contact_phone: '01011223399',
        contact_whatsapp: '01011223399',
        contact_email: 'hr@pyramids-consulting.com',
        contact_info: 'المهندسين، شارع جامعة الدول العربية، مبنى النخبة',
        source: 'web',
        is_featured: false,
        is_urgent: false
      },
      {
        title: 'أخصائي تسويق رقمي وإدارة حملات إعلانية (Media Buyer)',
        slug: 'media-buyer-digital-marketing-nasrcity',
        description: `مطلوب ميديا باير ومسوق إلكتروني لإدارة الميزانيات والحملات الإعلانية الممولة على فيسبوك، تيك توك، جوجل، وسناب شات مع تحليل البيانات ومعدلات التحويل (ROAS).`,
        requirements: `- خبرة مثبتة بسجلات حملات إعلانية سابقة ناجحة (لا تقل عن سنتين).
- احتراف استخدام Facebook Ads Manager, Google Ads, TikTok Ads.
- مهارة قراءة تحليلات Google Analytics وقياس العائد الاستثماري.
- عقلية تحليلية وقدرة على عمل A/B Testing مستمر للمحتوى.`,
        benefits: `- راتب أساسي 10,000 إلى 15,000 ج.م + نسبة وبونص على نجاح الحملات.
- إمكانية العمل بنظام هجين (Hybrid).
- بيئة عمل إبداعية وديناميكية.
- توفير أحدث أدوات التحليل والذكاء الاصطناعي المدفوعة.`,
        company_name: 'كرييتف ميديا إيجنسي',
        company_website: 'https://creative-agency.example.com',
        category_id: catMarketing.id,
        governorate_id: govCairo.id,
        city: 'مدينة نصر - القاهرة',
        qualification: 'bachelors',
        min_experience_years: 2,
        working_hours: '9:30 ص إلى 5:30 م',
        salary_min: 10000,
        salary_max: 15000,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['Media Buying', 'Meta Ads', 'Google Ads', 'Analytics'],
        status: 'published',
        posted_by: employerTech.id,
        approved_by: adminUser.id,
        approved_at: new Date(Date.now() - 5 * 86400000),
        published_at: new Date(Date.now() - 5 * 86400000),
        views_count: 155,
        applications_count: 7,
        contact_phone: '01199884422',
        contact_whatsapp: '01199884422',
        contact_email: 'ads@creative-media.com',
        contact_info: 'مدينة نصر، شارع عباس العقاد، مجمع البنوك',
        source: 'web',
        is_featured: false,
        is_urgent: false
      },
      // Pending Jobs for Admin review demonstration!
      {
        title: 'مصمم جرافيك سوشيال ميديا وهوية بصرية (قيد المراجعة)',
        slug: 'graphic-designer-branding-cairo-pending',
        description: `مطلوب مصمم جرافيك محترف لابتكار بوستات السوشيال ميديا وتصاميم الهوية التجارية للعملاء وإعداد المواد الدعائية المطبوعة.`,
        requirements: `- إتقان برامج Adobe: Photoshop, Illustrator, InDesign.
- بورتفوليو أعمال حقيقي وجذاب (Behance).
- الإلمام بأساسيات الموشن جرافيك ميزة إضافية.`,
        benefits: `- راتب من 8,000 إلى 12,000 ج.م.
- بيئة عمل مرنة مع إمكانية العمل عن بعد جزئياً.`,
        company_name: 'ديجيتال أرت ستوديو',
        company_website: '',
        category_id: catMarketing.id,
        governorate_id: govCairo.id,
        city: 'مصر الجديدة',
        qualification: 'bachelors',
        min_experience_years: 2,
        working_hours: 'دوام كامل',
        salary_min: 8000,
        salary_max: 12000,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['Photoshop', 'Illustrator', 'Branding'],
        status: 'pending', // Pending review for admin dashboard!
        posted_by: employerTech.id,
        views_count: 0,
        applications_count: 0,
        contact_phone: '01099112233',
        contact_whatsapp: '01099112233',
        contact_email: 'design@digital-arts.com',
        contact_info: 'مصر الجديدة، ميدان روكسي',
        source: 'web',
        is_featured: false,
        is_urgent: false
      },
      {
        title: 'أمين مخزن ومسؤول جرد قطع غيار (قيد المراجعة)',
        slug: 'warehouse-keeper-spare-parts-pending',
        description: `مطلوب أمين مخزن للإشراف على استلام وصرف وتسجيل قطع غيار السيارات والأجهزة ومطابقة الأرصدة الدفترية بالأرصدة الفعلية في المستودع.`,
        requirements: `- مؤهل متوسط أو فوق متوسط.
- خبرة سنة في أعمال المخازن والجرد الدوري.
- مهارة العمل على برامج المخازن والإكسيل.`,
        benefits: `- راتب 6,000 إلى 7,500 ج.م.
- تأمينات اجتماعية وصحية وسكن للمغتربين.`,
        company_name: 'الأمل لتوزيع قطع الغيار',
        company_website: '',
        category_id: catSales.id,
        governorate_id: govGiza.id,
        city: 'المنطقة الصناعية بأبو رواش',
        qualification: 'diploma',
        min_experience_years: 1,
        working_hours: '8 ساعات يومياً',
        salary_min: 6000,
        salary_max: 7500,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['إدارة مخازن', 'جرد دوري', 'إكسيل'],
        status: 'pending', // Pending review for admin dashboard!
        posted_by: employerAraby.id,
        views_count: 0,
        applications_count: 0,
        contact_phone: '01155443322',
        contact_whatsapp: '01155443322',
        contact_email: 'warehouse@amal-parts.com',
        contact_info: 'أبو رواش، طريق القاهرة الإسكندرية الصحراوي',
        source: 'web',
        is_featured: false,
        is_urgent: false
      },
      // Job imported via Telegram Bot feature!
      {
        title: 'مطلوب كاشير وموظفي فرع لسوبر ماركت شهير (مستوردة من تليجرام)',
        slug: 'cashier-supermarket-cairo-telegram-import',
        description: `مطلوب شباب للعمل كاشير وموظفي ممرات بفروع سوبر ماركت كبرى في القاهرة والجيزة.
ساعات العمل 8 ساعات، تأمين صحي واجتماعي، بونص شهري. للتقديم التواصل واتساب على الرقم الموضح.`,
        requirements: `- مؤهل متوسط أو عالي.
- السن حتى 35 سنة.
- قرب السكن من فروع السوبر ماركت.`,
        benefits: `- راتب 5,000 إلى 6,000 ج.م + حوافز.
- تدريب مدفوع الأجر.`,
        company_name: 'أسواق المدينة هايبر ماركت',
        company_website: '',
        category_id: catSales.id,
        governorate_id: govCairo.id,
        city: 'عين شمس / الزيتون',
        qualification: 'diploma',
        min_experience_years: 0,
        working_hours: '8 ساعات شفتات',
        salary_min: 5000,
        salary_max: 6000,
        salary_currency: 'EGP',
        show_salary: true,
        skills_required: ['كاشير', 'خدمة عملاء', 'جرد سريع'],
        status: 'published',
        approved_by: adminUser.id,
        approved_at: new Date(),
        published_at: new Date(),
        views_count: 85,
        applications_count: 3,
        contact_phone: '01288776655',
        contact_whatsapp: '01288776655',
        contact_email: 'jobs@madina-market.example.com',
        contact_info: 'عين شمس، شارع أحمد عصمت',
        source: 'telegram',
        telegram_message_id: '10452',
        telegram_message_url: 'https://t.me/EgyptJobsOfficial/10452',
        telegram_raw_text: 'مطلوب كاشير وموظفين فرع لسوبر ماركت كبير بالقاهرة للتواصل واتساب 01288776655',
        is_featured: false,
        is_urgent: false
      }
    ];

    const createdJobs = [];
    for (const jData of jobsData) {
      const [j] = await Job.findOrCreate({
        where: { slug: jData.slug },
        defaults: jData
      });
      createdJobs.push(j);
    }
    console.log(`✅ تم إنشاء وتحديث ${createdJobs.length} وظيفة نموذجية بمختلف الحالات.`);

    // Map created jobs for quick reference
    const jobFullStack = createdJobs.find(j => j.slug === 'fullstack-nodejs-react-niletech');
    const jobSales = createdJobs.find(j => j.slug === 'b2b-sales-representative-elaraby');
    const jobCS = createdJobs.find(j => j.slug === 'customer-service-rep-alex-callcenter');
    const jobFinance = createdJobs.find(j => j.slug === 'general-accountant-delta-mansoura');
    const jobTech = createdJobs.find(j => j.slug === 'plc-electrical-technician-10th-ramadan');
    const jobDrivers = createdJobs.find(j => j.slug === 'drivers-logistics-qalyubia');
    const jobLabor = createdJobs.find(j => j.slug === 'packaging-production-workers-6october');
    const jobSecurity = createdJobs.find(j => j.slug === 'security-guards-tagamoa-malls');

    console.log('📝 إنشاء طلبات التقديم (Applications) بمختلف الحالات...');

    // Ahmed applied to FullStack -> Shortlisted / Interview
    const [appAhmed] = await Application.findOrCreate({
      where: { job_id: jobFullStack.id, user_id: seekerAhmed.id },
      defaults: {
        status: 'interview',
        status_note: 'مرشح متميز تقنياً، تم تحديد موعد المقابلة الفنية يوم الأربعاء القادم الساعة 1 ظهراً.',
        reviewed_by: employerTech.id,
        reviewed_at: new Date()
      }
    });

    // Sara applied to Sales -> Accepted
    const [appSaraSales] = await Application.findOrCreate({
      where: { job_id: jobSales.id, user_id: seekerSara.id },
      defaults: {
        status: 'accepted',
        status_note: 'تم قبول المرشحة واجتياز فترة التدريب والمقابلة بنجاح واستلام العمل.',
        reviewed_by: employerAraby.id,
        reviewed_at: new Date(Date.now() - 5 * 86400000)
      }
    });

    // Sara applied to CS -> Shortlisted
    const [appSaraCS] = await Application.findOrCreate({
      where: { job_id: jobCS.id, user_id: seekerSara.id },
      defaults: {
        status: 'shortlisted',
        status_note: 'مطابقة لمعايير اللغة الإنجليزية ولباقة التحدث.',
        reviewed_by: employerTech.id,
        reviewed_at: new Date()
      }
    });

    // Mohamed applied to Tech -> Accepted
    const [appMohamedTech] = await Application.findOrCreate({
      where: { job_id: jobTech.id, user_id: seekerMohamed.id },
      defaults: {
        status: 'accepted',
        status_note: 'خبرة ممتازة في دوائر الكنترول الصناعي وتم التعيين بالمصنع.',
        reviewed_by: employerAraby.id,
        reviewed_at: new Date(Date.now() - 10 * 86400000)
      }
    });

    // Khaled applied to Labor -> Accepted
    const [appKhaledLabor] = await Application.findOrCreate({
      where: { job_id: jobLabor.id, user_id: seekerKhaled.id },
      defaults: {
        status: 'accepted',
        status_note: 'تم استلام العمل بخط إنتاج الحلويات بمدينة 6 أكتوبر.',
        reviewed_by: employerAraby.id,
        reviewed_at: new Date(Date.now() - 15 * 86400000)
      }
    });

    // Khaled applied to Security -> Submitted (قيد المراجعة)
    const [appKhaledSecurity] = await Application.findOrCreate({
      where: { job_id: jobSecurity.id, user_id: seekerKhaled.id },
      defaults: {
        status: 'submitted',
        status_note: 'طلب جديد بانتظار فحص مسؤول التوظيف'
      }
    });

    console.log('📊 إنشاء إحصائيات ونتائج التوظيف (Employment Outcomes) للوحة تحليلات الإدارة...');

    // 1. Sara hired via platform
    await EmploymentOutcome.findOrCreate({
      where: { application_id: appSaraSales.id },
      defaults: {
        job_id: jobSales.id,
        user_id: seekerSara.id,
        outcome: 'hired',
        via_platform: true,
        notes: 'تم التوظيف بنجاح من خلال المنصة ومباشرة العمل كمسؤولة مبيعات خارجية.',
        responded_at: new Date(Date.now() - 3 * 86400000)
      }
    });

    // 2. Mohamed hired via platform
    await EmploymentOutcome.findOrCreate({
      where: { application_id: appMohamedTech.id },
      defaults: {
        job_id: jobTech.id,
        user_id: seekerMohamed.id,
        outcome: 'hired',
        via_platform: true,
        notes: 'تم استلام العمل في مصنع الأجهزة بالعاشر من رمضان براتب ممتاز وتأمين.',
        responded_at: new Date(Date.now() - 8 * 86400000)
      }
    });

    // 3. Khaled hired via platform
    await EmploymentOutcome.findOrCreate({
      where: { application_id: appKhaledLabor.id },
      defaults: {
        job_id: jobLabor.id,
        user_id: seekerKhaled.id,
        outcome: 'hired',
        via_platform: true,
        notes: 'تم توفير السكن والانضمام لوردية التعبئة والتغليف.',
        responded_at: new Date(Date.now() - 12 * 86400000)
      }
    });

    console.log('🔓 إضافة فتح بيانات التواصل (Job Contact Unlocks)...');
    await JobContactUnlock.findOrCreate({
      where: { job_id: jobFullStack.id, user_id: seekerAhmed.id },
      defaults: {
        application_id: appAhmed.id,
        ip_address: '127.0.0.1'
      }
    });

    await JobContactUnlock.findOrCreate({
      where: { job_id: jobSales.id, user_id: seekerSara.id },
      defaults: {
        application_id: appSaraSales.id,
        ip_address: '127.0.0.1'
      }
    });

    console.log('⭐ إضافة وظائف محفوظة (Saved Jobs)...');
    await SavedJob.findOrCreate({
      where: { user_id: seekerAhmed.id, job_id: jobFinance.id },
      defaults: { saved_at: new Date() }
    });
    await SavedJob.findOrCreate({
      where: { user_id: seekerAhmed.id, job_id: jobDrivers.id },
      defaults: { saved_at: new Date() }
    });
    await SavedJob.findOrCreate({
      where: { user_id: seekerSara.id, job_id: jobCS.id },
      defaults: { saved_at: new Date() }
    });

    console.log('🚨 إضافة بلاغات عن الوظائف (Reports) للوحة تحكم المدير...');
    await Report.findOrCreate({
      where: { user_id: seekerSara.id, job_id: jobCS.id },
      defaults: {
        reason: 'استفسار بخصوص موقع المقابلة، هل متاح العمل عن بعد بالكامل؟',
        status: 'pending'
      }
    });
    await Report.findOrCreate({
      where: { user_id: seekerMohamed.id, job_id: jobDrivers.id },
      defaults: {
        reason: 'تم التعيين والوظيفة اكتمل العدد المطلوب بها، يرجى إغلاق الإعلان.',
        status: 'resolved',
        admin_notes: 'تم التواصل مع الشركة وتأكيد الاكتفاء وتحديث حالة الإعلان.'
      }
    });

    console.log('🔔 إضافة إشعارات (Notifications) للمستخدمين...');
    await Notification.findOrCreate({
      where: { user_id: seekerAhmed.id, title: 'تحديد موعد مقابلة عمل' },
      defaults: {
        type: 'application_status',
        message: 'تم تحديد موعد لمقابلة عملك في وظيفة "مطور برمجيات Full Stack" لدى شركة النيل للحلول التقنية.',
        link: '/user/applications',
        is_read: false
      }
    });

    await Notification.findOrCreate({
      where: { user_id: seekerSara.id, title: 'تهانينا! تم قبول طلب التوظيف' },
      defaults: {
        type: 'application_status',
        message: 'تم قبولك بنجاح في وظيفة "مسؤول مبيعات خارجية B2B" لدى مجموعة العربي.',
        link: '/user/applications',
        is_read: true,
        read_at: new Date()
      }
    });

    console.log('🤖 إضافة قناة تليجرام وسجلات استيراد (Telegram Bot Integration)...');
    const [teleChannel] = await TelegramChannel.findOrCreate({
      where: { channel_id: '-1001928374650' },
      defaults: {
        channel_name: 'قناة وظائف مصر اليومية الرسمية',
        channel_username: 'EgyptJobsOfficial',
        is_active: true,
        added_by: adminUser.id,
        messages_count: 340,
        jobs_created: 48
      }
    });

    await TelegramImport.findOrCreate({
      where: { channel_id: teleChannel.id, message_id: '10452' },
      defaults: {
        message_text: 'مطلوب كاشير وموظفين فرع لسوبر ماركت كبير بالقاهرة للتواصل واتساب 01288776655',
        extracted_data: {
          title: 'كاشير وموظفي فرع لسوبر ماركت',
          salary: '5000 - 6000',
          governorate: 'القاهرة'
        },
        confidence_score: 0.94,
        status: 'processed',
        job_id: createdJobs.find(j => j.slug === 'cashier-supermarket-cairo-telegram-import')?.id,
        processed_at: new Date()
      }
    });

    await TelegramImport.findOrCreate({
      where: { channel_id: teleChannel.id, message_id: '10453' },
      defaults: {
        message_text: 'مطلوب صنايعي جبس بورد وتشطيبات للتواصل الفوري 01000000000',
        extracted_data: {
          title: 'فني تشطيبات وجبس بورد',
          governorate: 'الجيزة'
        },
        confidence_score: 0.88,
        status: 'pending'
      }
    });

    console.log('🎉 اكتمل إدخال البيانات النموذجية الشاملة بنجاح!');
  } catch (error) {
    console.error('❌ حدث خطأ أثناء إدخال البيانات:', error);
  } finally {
    process.exit(0);
  }
}

seedShowcase();
