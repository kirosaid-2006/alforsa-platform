const { Application, Job, EmploymentOutcome } = require('../models');

exports.dashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const applicationsCount = await Application.count({ where: { user_id: userId } });
        
        // Count saved jobs logic (simplified for now as we don't have direct access without SavedJob model imported)
        const userWithSaved = await req.user.getSavedJobs();
        const savedCount = userWithSaved.length;

        // Fetch recent applications for dashboard
        const recentApplications = await Application.findAll({
            where: { user_id: userId },
            include: [
                { model: Job, as: 'job' },
                { model: EmploymentOutcome, required: false }
            ],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        res.render('pages/user/dashboard', {
            title: 'لوحة التحكم',
            path: '/user/dashboard',
            applicationsCount,
            savedCount,
            recentApplications
        });
    } catch (error) {
        console.error('User Dashboard Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.myApplications = async (req, res) => {
    try {
        const applications = await Application.findAll({
            where: { user_id: req.user.id },
            include: [
                { model: Job, as: 'job' },
                { model: EmploymentOutcome, required: false }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.render('pages/user/applications', { // Reusing dashboard or a specific view if needed
            title: 'تقديماتي',
            path: '/user/my-applications',
            applications
        });
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

exports.savedJobs = async (req, res) => {
    try {
        let savedJobs = [];
        // Assuming we added the relationship: user.belongsToMany(Job, { through: 'SavedJobs' })
        if (req.user.getSavedJobs) {
            savedJobs = await req.user.getSavedJobs({
                include: [{ model: require('../models').Governorate, as: 'governorate' }]
            });
        }

        res.render('pages/user/saved-jobs', {
            title: 'الوظائف المحفوظة',
            path: '/user/saved-jobs',
            savedJobs
        });
    } catch (error) {
        console.error('Saved Jobs Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.showProfile = async (req, res) => {
    try {
        const governorates = await require('../models').Governorate.findAll({ order: [['sort_order', 'ASC'], ['name', 'ASC']] });
        
        res.render('pages/user/profile', {
            title: 'تعديل الملف الشخصي',
            path: '/user/profile',
            governorates
        });
    } catch (error) {
        console.error('Show Profile Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { full_name, email, phone, whatsapp_phone, governorate_id, city, qualification, last_job_title } = req.body;
        
        const user = req.user;
        
        // Convert Arabic numerals to English numerals
        const toEnglishNumbers = (str) => {
            if (!str) return str;
            const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
            return str.replace(/[٠-٩]/g, w => arabicNumbers.indexOf(w));
        };

        user.full_name = full_name;
        user.email = email || null;
        user.phone = toEnglishNumbers(phone);
        user.whatsapp_phone = toEnglishNumbers(whatsapp_phone);
        user.governorate_id = governorate_id;
        user.city = city;
        user.qualification = qualification;
        user.last_job_title = last_job_title;

        await user.save();

        // Update session name if changed
        req.session.user.full_name = user.full_name;

        req.flash('success', 'تم تحديث بيانات ملفك الشخصي بنجاح!');
        res.redirect('/user/profile');
    } catch (error) {
        console.error('Update Profile Error:', error);
        req.flash('error', 'حدث خطأ أثناء تحديث البيانات. يرجى التأكد من أن البريد أو رقم الهاتف غير مستخدم مسبقاً.');
        res.redirect('/user/profile');
    }
};
