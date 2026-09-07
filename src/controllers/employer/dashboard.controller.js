const { Job, Governorate, Category, JobContactUnlock } = require('../../models');

exports.index = async (req, res) => {
    try {
        const userId = req.user.id;

        const jobs = await Job.findAll({
            where: { posted_by: userId },
            order: [['createdAt', 'DESC']]
        });

        const activeJobsCount = jobs.filter(j => j.status === 'published').length;
        const totalViews = jobs.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
        const totalUnlocks = jobs.reduce((acc, curr) => acc + (curr.applications_count || 0), 0);

        res.render('pages/employer/dashboard', {
            title: 'لوحة تحكم الشركات',
            path: '/employer',
            jobs,
            activeJobsCount,
            totalViews,
            totalUnlocks
        });
    } catch (error) {
        console.error('Employer Dashboard Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.showPostJob = async (req, res) => {
    try {
        const governorates = await Governorate.findAll({ order: [['sort_order', 'ASC']] });
        const categories = await Category.findAll({ order: [['sort_order', 'ASC']] });

        res.render('pages/employer/post-job', {
            title: 'نشر وظيفة جديدة',
            path: '/employer/post-job',
            governorates,
            categories
        });
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

exports.postJob = async (req, res) => {
    try {
        const {
            title, category_id, company_name, governorate_id, city,
            description, requirements, qualification, experience,
            salary_min, salary_max, show_salary,
            contact_phone, contact_whatsapp, contact_info
        } = req.body;

        // Create the job as 'pending'
        await Job.create({
            title,
            slug: `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`, // Simple slug
            description,
            requirements,
            company_name,
            category_id,
            governorate_id,
            city,
            qualification,
            min_experience_years: parseInt(experience) || 0,
            salary_min: salary_min ? parseInt(salary_min) : null,
            salary_max: salary_max ? parseInt(salary_max) : null,
            show_salary: show_salary === 'true',
            contact_phone,
            contact_whatsapp,
            contact_info,
            image_url: req.file ? `/uploads/jobs/${req.file.filename}` : null,
            posted_by: req.user.id,
            status: 'pending',
            source: 'web'
        });

        req.flash('success', 'تم إرسال الوظيفة بنجاح! سيتم مراجعتها من قبل الإدارة قبل نشرها.');
        res.redirect('/employer');
    } catch (error) {
        console.error('Post Job Error:', error);
        req.flash('error', 'حدث خطأ أثناء إضافة الوظيفة. يرجى التأكد من صحة البيانات.');
        res.redirect('back');
    }
};
