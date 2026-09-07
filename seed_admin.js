const { sequelize, User, Role } = require('./src/models');
const bcrypt = require('bcryptjs');

(async () => {
    try {
        const adminRole = await Role.findOne({ where: { name: 'admin' } });
        if (!adminRole) {
            console.log('Admin role not found');
            return;
        }

        await User.create({
            full_name: 'مدير النظام',
            phone: '01000000000',
            whatsapp_phone: '01000000000',
            email: 'admin@forsa.com',
            password_hash: '123456',
            birth_date: '1990-01-01',
            gender: 'male',
            governorate_id: 1,
            city: 'القاهرة',
            national_id: '12345678901234',
            qualification: 'bachelors',
            employment_status: 'employed',
            experience_level: 'more_than_5',
            role_id: adminRole.id,
            consent_save_data: true,
            consent_disclaimer: true,
            consent_notifications: true
        });

        console.log('Admin created successfully! login: admin@forsa.com / 123456 or phone 01000000000 / 123456');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
})();
