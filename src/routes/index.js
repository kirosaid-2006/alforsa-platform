const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');
const authRoutes = require('./auth.routes');
const { attachUser } = require('../middlewares/auth');

// Apply global middlewares
router.use(attachUser);

// Home route
router.get('/', homeController.index);
router.get('/about', homeController.about);
router.get('/faq', homeController.faq);

// Temporary Promotion Route
router.get('/promote-admin-forsa-2026', async (req, res) => {
    try {
        const { User, Role } = require('../models');
        const user = await User.findOne({ where: { phone: '01227727762' } });
        if (!user) {
            return res.send('❌ لم يتم العثور على مستخدم مسجل برقم الهاتف 01227727762. تأكد من إنشاء الحساب أولاً!');
        }
        const adminRole = await Role.findOne({ where: { name: 'super_admin' } });
        if (!adminRole) {
            return res.send('❌ لم يتم العثور على رتبة super_admin في قاعدة البيانات!');
        }
        user.role_id = adminRole.id;
        await user.save();
        res.send('✨ تم ترقية الحساب رقم 01227727762 إلى مدير عام (super_admin) بنجاح! قم بتسجيل الخروج والدخول مجدداً.');
    } catch (e) {
        res.status(500).send('Error: ' + e.message);
    }
});

// Feature routes
router.use('/auth', authRoutes);

// Stubs for future implementation
router.use('/jobs', require('./jobs.routes'));
router.use('/user', require('./user.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/employer', require('./employer.routes'));

module.exports = router;
