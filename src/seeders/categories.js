const { Category } = require('../models');

async function seedCategories() {
  const categories = [
    { name: 'محاسبين ومالية', slug: 'accounting-finance', icon: '📊', color: 'bg-amber-100 text-amber-800', sort_order: 1 },
    { name: 'عمال بدون شهادة', slug: 'manual-labor', icon: '👷', color: 'bg-indigo-100 text-indigo-800', sort_order: 2 },
    { name: 'سائقين', slug: 'drivers', icon: '🚗', color: 'bg-teal-100 text-teal-800', sort_order: 3 },
    { name: 'فنيين وحرفيين', slug: 'technicians-craftsmen', icon: '🔧', color: 'bg-pink-100 text-pink-800', sort_order: 4 },
    { name: 'أفراد أمن وحراسة', slug: 'security', icon: '🛡️', color: 'bg-yellow-100 text-yellow-800', sort_order: 5 },
    { name: 'مبيعات ومشتريات', slug: 'sales', icon: '🛒', color: 'bg-rose-100 text-rose-800', sort_order: 6 },
    { name: 'خدمة عملاء', slug: 'customer-service', icon: '🎧', color: 'bg-purple-100 text-purple-800', sort_order: 7 },
    { name: 'تكنولوجيا المعلومات', slug: 'it-software', icon: '💻', color: 'bg-sky-100 text-sky-800', sort_order: 8 },
    { name: 'هندسة', slug: 'engineering', icon: '📐', color: 'bg-green-100 text-green-800', sort_order: 9 },
    { name: 'طب وصيدلة', slug: 'medical-pharma', icon: '⚕️', color: 'bg-red-100 text-red-800', sort_order: 10 },
    { name: 'تعليم وتدريس', slug: 'education-teaching', icon: '📚', color: 'bg-orange-100 text-orange-800', sort_order: 11 },
    { name: 'إدارة وموارد بشرية', slug: 'management-hr', icon: '👥', color: 'bg-blue-100 text-blue-800', sort_order: 12 },
    { name: 'تسويق وإعلان', slug: 'marketing-advertising', icon: '📢', color: 'bg-fuchsia-100 text-fuchsia-800', sort_order: 13 },
    { name: 'قانون ومحاماة', slug: 'legal', icon: '⚖️', color: 'bg-stone-100 text-stone-800', sort_order: 14 },
    { name: 'مطاعم وفنادق', slug: 'hospitality-food', icon: '🍽️', color: 'bg-lime-100 text-lime-800', sort_order: 15 },
  ];

  for (const cat of categories) {
    await Category.findOrCreate({
      where: { slug: cat.slug },
      defaults: cat,
    });
  }
  console.log('✅ Categories seeded successfully.');
}

module.exports = seedCategories;
