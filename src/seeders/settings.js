const { Setting } = require('../models');

async function seedSettings() {
  const settings = [
    { key: 'site_name', value: 'فرصة', description: 'اسم المنصة', is_public: true },
    { key: 'contact_email', value: 'support@forsa.com', description: 'البريد الإلكتروني للتواصل', is_public: true },
    { key: 'telegram_import_enabled', value: 'true', description: 'تفعيل الاستيراد التلقائي من تليجرام', is_public: false },
    { key: 'maintenance_mode', value: 'false', description: 'وضع الصيانة', is_public: true },
    { key: 'survey_reminder_days', value: '15', description: 'عدد الأيام قبل إرسال استبيان التوظيف', is_public: false },
  ];

  for (const setting of settings) {
    await Setting.findOrCreate({
      where: { key: setting.key },
      defaults: setting,
    });
  }
  console.log('✅ Settings seeded successfully.');
}

module.exports = seedSettings;
