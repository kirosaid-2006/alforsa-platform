const { Role } = require('../models');

async function seedRoles() {
  const roles = [
    { name: 'super_admin', description: 'مدير عام المنصة (صلاحيات كاملة)', is_system: true },
    { name: 'admin', description: 'مدير (إدارة المحتوى والمستخدمين)', is_system: true },
    { name: 'moderator', description: 'مشرف (مراجعة الوظائف فقط)', is_system: true },
    { name: 'employer', description: 'صاحب عمل / شركة', is_system: true },
    { name: 'user', description: 'باحث عن عمل', is_system: true },
  ];

  for (const roleData of roles) {
    await Role.findOrCreate({
      where: { name: roleData.name },
      defaults: roleData,
    });
  }
  console.log('✅ Roles seeded successfully.');
}

module.exports = seedRoles;
