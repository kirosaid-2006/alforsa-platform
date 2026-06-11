const { Governorate } = require('../models');

async function seedGovernorates() {
  const governorates = [
    { name: 'القاهرة', name_en: 'Cairo', slug: 'cairo', sort_order: 1 },
    { name: 'الإسكندرية', name_en: 'Alexandria', slug: 'alexandria', sort_order: 2 },
    { name: 'الجيزة', name_en: 'Giza', slug: 'giza', sort_order: 3 },
    { name: 'القليوبية', name_en: 'Qalyubia', slug: 'qalyubia', sort_order: 4 },
    { name: 'الدقهلية', name_en: 'Dakahlia', slug: 'dakahlia', sort_order: 5 },
    { name: 'الشرقية', name_en: 'Sharqia', slug: 'sharqia', sort_order: 6 },
    { name: 'الغربية', name_en: 'Gharbia', slug: 'gharbia', sort_order: 7 },
    { name: 'المنوفية', name_en: 'Monufia', slug: 'monufia', sort_order: 8 },
    { name: 'البحيرة', name_en: 'Beheira', slug: 'beheira', sort_order: 9 },
    { name: 'كفر الشيخ', name_en: 'Kafr El Sheikh', slug: 'kafr-el-sheikh', sort_order: 10 },
    { name: 'دمياط', name_en: 'Damietta', slug: 'damietta', sort_order: 11 },
    { name: 'بورسعيد', name_en: 'Port Said', slug: 'port-said', sort_order: 12 },
    { name: 'الإسماعيلية', name_en: 'Ismailia', slug: 'ismailia', sort_order: 13 },
    { name: 'السويس', name_en: 'Suez', slug: 'suez', sort_order: 14 },
    { name: 'الفيوم', name_en: 'Faiyum', slug: 'faiyum', sort_order: 15 },
    { name: 'بني سويف', name_en: 'Beni Suef', slug: 'beni-suef', sort_order: 16 },
    { name: 'المنيا', name_en: 'Minya', slug: 'minya', sort_order: 17 },
    { name: 'أسيوط', name_en: 'Assiut', slug: 'assiut', sort_order: 18 },
    { name: 'سوهاج', name_en: 'Sohag', slug: 'sohag', sort_order: 19 },
    { name: 'قنا', name_en: 'Qena', slug: 'qena', sort_order: 20 },
    { name: 'الأقصر', name_en: 'Luxor', slug: 'luxor', sort_order: 21 },
    { name: 'أسوان', name_en: 'Aswan', slug: 'aswan', sort_order: 22 },
    { name: 'البحر الأحمر', name_en: 'Red Sea', slug: 'red-sea', sort_order: 23 },
    { name: 'الوادي الجديد', name_en: 'New Valley', slug: 'new-valley', sort_order: 24 },
    { name: 'مطروح', name_en: 'Matrouh', slug: 'matrouh', sort_order: 25 },
    { name: 'شمال سيناء', name_en: 'North Sinai', slug: 'north-sinai', sort_order: 26 },
    { name: 'جنوب سيناء', name_en: 'South Sinai', slug: 'south-sinai', sort_order: 27 },
  ];

  for (const gov of governorates) {
    await Governorate.findOrCreate({
      where: { slug: gov.slug },
      defaults: gov,
    });
  }
  console.log('✅ Governorates seeded successfully.');
}

module.exports = seedGovernorates;
