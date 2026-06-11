const { Permission, Role } = require('../models');

async function seedPermissions() {
  const permissionsData = [
    // الوظائف
    { name: 'jobs.view', group: 'jobs', description: 'عرض الوظائف' },
    { name: 'jobs.create', group: 'jobs', description: 'إضافة وظيفة جديدة' },
    { name: 'jobs.edit', group: 'jobs', description: 'تعديل وظيفة' },
    { name: 'jobs.delete', group: 'jobs', description: 'حذف وظيفة' },
    { name: 'jobs.approve', group: 'jobs', description: 'اعتماد الوظائف المعلقة' },
    // المستخدمين
    { name: 'users.view', group: 'users', description: 'عرض المستخدمين' },
    { name: 'users.edit', group: 'users', description: 'تعديل المستخدمين' },
    { name: 'users.ban', group: 'users', description: 'حظر المستخدمين' },
    // التقديمات
    { name: 'applications.view', group: 'applications', description: 'عرض التقديمات' },
    { name: 'applications.manage', group: 'applications', description: 'إدارة التقديمات وتغيير حالتها' },
    // النظام
    { name: 'settings.manage', group: 'settings', description: 'إدارة إعدادات النظام' },
    { name: 'telegram.manage', group: 'telegram', description: 'إدارة قنوات تليجرام' },
    { name: 'analytics.view', group: 'analytics', description: 'عرض الإحصائيات' },
  ];

  for (const perm of permissionsData) {
    await Permission.findOrCreate({
      where: { name: perm.name },
      defaults: perm,
    });
  }

  // Assign permissions to super_admin
  const superAdminRole = await Role.findOne({ where: { name: 'super_admin' } });
  if (superAdminRole) {
    const allPermissions = await Permission.findAll();
    await superAdminRole.setPermissions(allPermissions);
  }

  // Assign specific permissions to admin
  const adminRole = await Role.findOne({ where: { name: 'admin' } });
  if (adminRole) {
    const adminPermissions = await Permission.findAll({
      where: {
        name: [
          'jobs.view', 'jobs.edit', 'jobs.delete', 'jobs.approve',
          'users.view', 'users.edit', 'users.ban',
          'applications.view', 'applications.manage',
          'telegram.manage', 'analytics.view'
        ]
      }
    });
    await adminRole.setPermissions(adminPermissions);
  }

  // Assign to moderator
  const moderatorRole = await Role.findOne({ where: { name: 'moderator' } });
  if (moderatorRole) {
    const modPermissions = await Permission.findAll({
      where: {
        name: ['jobs.view', 'jobs.approve', 'users.view', 'applications.view']
      }
    });
    await moderatorRole.setPermissions(modPermissions);
  }

  // Assign to employer
  const employerRole = await Role.findOne({ where: { name: 'employer' } });
  if (employerRole) {
    const empPermissions = await Permission.findAll({
      where: {
        name: ['jobs.view', 'jobs.create', 'jobs.edit', 'applications.view', 'applications.manage']
      }
    });
    await employerRole.setPermissions(empPermissions);
  }

  // Assign to user
  const userRole = await Role.findOne({ where: { name: 'user' } });
  if (userRole) {
    const userPermissions = await Permission.findAll({
      where: {
        name: ['jobs.view', 'applications.view']
      }
    });
    await userRole.setPermissions(userPermissions);
  }

  console.log('✅ Permissions seeded successfully.');
}

module.exports = seedPermissions;
