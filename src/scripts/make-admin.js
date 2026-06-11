const { User, Role } = require('../models');

const phone = process.argv[2];

if (!phone) {
    console.log('❌ خطأ: يجب إدخال رقم الهاتف.');
    console.log('طريقة الاستخدام: node src/scripts/make-admin.js 01xxxxxxxxx');
    process.exit(1);
}

async function makeAdmin() {
    try {
        const user = await User.findOne({ where: { phone } });
        
        if (!user) {
            console.log(`❌ الحساب برقم ${phone} غير موجود. يرجى إنشاء حساب أولاً من الموقع.`);
            process.exit(1);
        }
        
        const superAdminRole = await Role.findOne({ where: { name: 'super_admin' } });
        
        if (!superAdminRole) {
            console.log('❌ خطأ: دور super_admin غير موجود في قاعدة البيانات. تأكد من تشغيل seeders.');
            process.exit(1);
        }

        user.role_id = superAdminRole.id;
        await user.save();
        
        console.log('====================================');
        console.log(`✅ تم الترقية بنجاح!`);
        console.log(`👤 الاسم: ${user.full_name}`);
        console.log(`📱 الهاتف: ${user.phone}`);
        console.log(`⚙️ الصلاحية الجديدة: مدير عام (Super Admin)`);
        console.log('يمكنك الآن عمل Refresh للصفحة وستظهر لك (لوحة الإدارة).');
        console.log('====================================');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ حدث خطأ داخلي:', err);
        process.exit(1);
    }
}

makeAdmin();
