const { User, Role, Governorate, Category } = require('../models');
const { Op } = require('sequelize');

exports.showRegister = async (req, res) => {
    try {
        const governorates = await Governorate.findAll({ order: [['sort_order', 'ASC'], ['name', 'ASC']] });
        const categories = await Category.findAll({ order: [['sort_order', 'ASC']] });
        
        res.render('pages/auth/register', {
            title: 'إنشاء حساب جديد',
            path: '/register',
            governorates,
            categories
        });
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
};

exports.register = async (req, res) => {
    try {
        let {
            full_name, national_id, phone, whatsapp_phone, email, password, confirm_password,
            birth_date, gender, governorate_id, city, detailed_address, church_name, qualification,
            college_institute, specialization, employment_status, experience_level,
            last_job_title, consent_save_data, consent_disclaimer, consent_notifications
        } = req.body;

        // Convert Arabic numerals to English numerals
        const toEnglishNumbers = (str) => {
            if (!str) return str;
            const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
            return str.replace(/[٠-٩]/g, w => arabicNumbers.indexOf(w));
        };

        national_id = toEnglishNumbers(national_id);
        phone = toEnglishNumbers(phone);
        whatsapp_phone = toEnglishNumbers(whatsapp_phone);

        // Basic validations
        if (password !== confirm_password) {
            req.flash('error', 'كلمات المرور غير متطابقة.');
            return res.redirect('back');
        }

        if (national_id.length !== 14) {
            req.flash('error', 'الرقم القومي يجب أن يتكون من 14 رقم بالضبط.');
            return res.redirect('back');
        }

        if (phone.length !== 11 || whatsapp_phone.length !== 11) {
            req.flash('error', 'رقم الهاتف ورقم الواتساب يجب أن يتكونا من 11 رقم بالضبط.');
            return res.redirect('back');
        }

        // Check if phone or national_id already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ phone }, { national_id }, { email: email || 'NONE' }]
            }
        });

        if (existingUser) {
            if (existingUser.phone === phone) req.flash('error', 'رقم الهاتف مستخدم بالفعل.');
            else if (existingUser.national_id === national_id) req.flash('error', 'الرقم القومي مستخدم بالفعل.');
            else if (existingUser.email === email) req.flash('error', 'البريد الإلكتروني مستخدم بالفعل.');
            return res.redirect('back');
        }

        // Get standard 'user' role
        const userRole = await Role.findOne({ where: { name: 'user' } });
        if (!userRole) {
            req.flash('error', 'حدث خطأ في النظام الداخلي. الدور غير موجود.');
            return res.redirect('back');
        }

        // Create User
        const newUser = await User.create({
            full_name,
            national_id,
            phone,
            whatsapp_phone,
            email: email || null,
            password_hash: password, // hooked to hash automatically
            birth_date,
            gender,
            governorate_id,
            city,
            detailed_address,
            church_name,
            qualification,
            college_institute,
            specialization,
            employment_status,
            experience_level,
            last_job_title,
            cv_url: req.file ? `/uploads/cvs/${req.file.filename}` : null,
            role_id: userRole.id,
            consent_save_data: consent_save_data === 'on',
            consent_disclaimer: consent_disclaimer === 'on',
            consent_notifications: consent_notifications === 'on'
        });

        req.flash('success', 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Registration Error:', error);
        req.flash('error', 'حدث خطأ أثناء التسجيل. يرجى التأكد من صحة البيانات (تأكد أن الرقم القومي 14 رقم والهاتف 11 رقم).');
        res.redirect('back');
    }
};

exports.showLogin = (req, res) => {
    res.render('pages/auth/login', {
        title: 'تسجيل الدخول',
        path: '/login'
    });
};

exports.login = async (req, res) => {
    try {
        let { login_identifier, password } = req.body;

        // Convert Arabic numerals to English numerals
        const toEnglishNumbers = (str) => {
            if (!str) return str;
            const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
            return str.replace(/[٠-٩]/g, w => arabicNumbers.indexOf(w));
        };
        
        login_identifier = toEnglishNumbers(login_identifier);

        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { phone: login_identifier },
                    { email: login_identifier }
                ]
            },
            include: [{ model: Role }]
        });

        if (!user || !user.is_active || user.is_banned) {
            req.flash('error', 'بيانات الدخول غير صحيحة أو الحساب موقوف.');
            return res.redirect('back');
        }

        const isValid = await user.validPassword(password);
        if (!isValid) {
            req.flash('error', 'كلمة المرور غير صحيحة.');
            return res.redirect('back');
        }

        // Set session
        req.session.user = {
            id: user.id,
            full_name: user.full_name,
            role: user.Role.name
        };

        req.flash('success', `مرحباً بك مجدداً ${user.full_name.split(' ')[0]}`);
        
        req.session.save((err) => {
            if (err) console.error('Session save error:', err);
            
            // Redirect based on role or to saved redirect
            const redirectUrl = req.query.redirect;
            if (redirectUrl) {
                return res.redirect(redirectUrl);
            }

            if (user.Role.name === 'admin' || user.Role.name === 'super_admin') {
                res.redirect('/admin');
            } else if (user.Role.name === 'employer') {
                res.redirect('/employer');
            } else {
                res.redirect('/user/dashboard');
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        req.flash('error', 'حدث خطأ أثناء تسجيل الدخول.');
        res.redirect('back');
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('Logout Error:', err);
        res.redirect('/');
    });
};
