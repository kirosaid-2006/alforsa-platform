const { User, Role } = require('./src/models');

(async () => {
    try {
        const phone = process.argv[2];
        
        if (!phone) {
            console.log('يرجى كتابة رقم الهاتف بجوار الأمر. مثال: node make-admin.js 01234567890');
            process.exit(1);
        }

        const adminRole = await Role.findOne({ where: { name: 'super_admin' } });
        if (!adminRole) {
            console.log('دور السوبر أدمن غير موجود في قاعدة البيانات!');
            process.exit(1);
        }

        const [updatedRows] = await User.update(
            { role_id: adminRole.id },
            { where: { phone: phone } }
        );

        if (updatedRows > 0) {
            console.log(`✅ تم ترقية الحساب صاحب الرقم ${phone} ليصبح سوبر أدمن (Super Admin) بأعلى صلاحيات بنجاح!`);
        } else {
            console.log(`❌ لم يتم العثور على حساب برقم الهاتف: ${phone}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
})();
