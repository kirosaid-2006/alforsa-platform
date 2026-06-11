const { Job, Category, Governorate } = require('../../models');

exports.pending = async (req, res) => {
    try {
        const jobs = await Job.findAll({
            where: { status: 'pending' },
            include: [
                { model: Category, as: 'category' },
                { model: Governorate, as: 'governorate' }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.render('pages/admin/pending', {
            title: 'مراجعة الوظائف',
            path: '/admin/jobs/pending',
            jobs
        });
    } catch (error) {
        console.error('Admin Pending Jobs Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.approve = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findByPk(id);
        
        if (!job) return res.redirect('/admin/jobs/pending');

        job.status = 'published';
        job.approved_by = req.user.id;
        job.approved_at = new Date();
        job.published_at = new Date();
        
        // Default expiry is 30 days
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        job.expires_at = expiryDate;

        await job.save();
        
        req.flash('success', 'تم اعتماد الوظيفة ونشرها بنجاح.');
        res.redirect('/admin/jobs/pending');
    } catch (error) {
        console.error('Approve Job Error:', error);
        req.flash('error', 'حدث خطأ أثناء الاعتماد.');
        res.redirect('/admin/jobs/pending');
    }
};

exports.showCreate = async (req, res) => {
    try {
        const categories = await require('../../models').Category.findAll();
        const governorates = await require('../../models').Governorate.findAll();
        
        res.render('pages/admin/jobs-create', {
            title: 'إضافة وظيفة',
            path: '/admin/jobs/create',
            categories,
            governorates
        });
    } catch (error) {
        console.error('Show Create Job Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.store = async (req, res) => {
    try {
        const { 
            title, company_name, category_id, governorate_id, 
            description, salary, contact_phone, contact_whatsapp,
            qualification, min_experience_years, working_hours 
        } = req.body;
        
        const slug = title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-') + '-' + Date.now();

        await Job.create({
            title,
            slug,
            description,
            company_name,
            salary: salary || null,
            qualification: qualification || null,
            min_experience_years: min_experience_years ? parseInt(min_experience_years) : null,
            working_hours: working_hours || null,
            contact_phone,
            contact_whatsapp: contact_whatsapp || null,
            image_url: req.file ? `/uploads/jobs/${req.file.filename}` : null,
            status: 'published', // Admin posts are published immediately
            published_at: new Date(),
            approved_at: new Date(),
            approved_by: req.user.id,
            is_remote: false,
            category_id,
            governorate_id,
            posted_by: req.user.id
        });

        req.flash('success', 'تم نشر الوظيفة بنجاح!');
        res.redirect('/admin/jobs/create');
    } catch (error) {
        console.error('Store Job Error:', error);
        req.flash('error', 'حدث خطأ أثناء حفظ الوظيفة.');
        res.redirect('/admin/jobs/create');
    }
};

exports.reject = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findByPk(id);
        
        if (!job) return res.redirect('/admin/jobs/pending');

        job.status = 'rejected';
        job.rejection_reason = 'تم الرفض بواسطة الإدارة';
        await job.save();
        
        req.flash('success', 'تم رفض الوظيفة.');
        res.redirect('/admin/jobs/pending');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/jobs/pending');
    }
};

exports.reports = async (req, res) => {
    try {
        const { Report, User } = require('../../models');
        const reports = await Report.findAll({
            include: [
                { model: Job, as: 'job' },
                { model: User, as: 'user', attributes: ['full_name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.render('pages/admin/reports', {
            title: 'بلاغات المستخدمين',
            path: '/admin/reports',
            reports
        });
    } catch (error) {
        console.error('Fetch Reports Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.resolveReport = async (req, res) => {
    try {
        const { Report } = require('../../models');
        const { id } = req.params;
        const report = await Report.findByPk(id);
        
        if (report) {
            report.status = 'resolved';
            await report.save();
            req.flash('success', 'تم تحديد البلاغ كمحلول.');
        }
        res.redirect('/admin/reports');
    } catch (error) {
        console.error('Resolve Report Error:', error);
        res.redirect('/admin/reports');
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const { Report } = require('../../models');
        const { id } = req.params;
        await Report.destroy({ where: { id } });
        req.flash('success', 'تم حذف البلاغ.');
        res.redirect('/admin/reports');
    } catch (error) {
        console.error('Delete Report Error:', error);
        res.redirect('/admin/reports');
    }
};

exports.index = async (req, res) => {
    try {
        const { category_id, status } = req.query;
        const whereClause = {};
        
        if (category_id) whereClause.category_id = category_id;
        if (status) whereClause.status = status;

        const jobs = await Job.findAll({
            where: whereClause,
            include: [
                { model: Category, as: 'category' },
                { model: Governorate, as: 'governorate' },
                { model: require('../../models').User, as: 'employer', attributes: ['full_name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        const categories = await Category.findAll();

        res.render('pages/admin/jobs-index', {
            title: 'إدارة الوظائف',
            path: '/admin/jobs',
            jobs,
            categories,
            query: req.query
        });
    } catch (error) {
        console.error('Admin Jobs Index Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.edit = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findByPk(id);
        
        if (!job) {
            req.flash('error', 'الوظيفة غير موجودة');
            return res.redirect('/admin/jobs');
        }

        const categories = await Category.findAll();
        const governorates = await Governorate.findAll();

        res.render('pages/admin/jobs-edit', {
            title: 'تعديل وظيفة',
            path: '/admin/jobs',
            job,
            categories,
            governorates
        });
    } catch (error) {
        console.error('Admin Jobs Edit Error:', error);
        res.redirect('/admin/jobs');
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, company_name, category_id, governorate_id, 
            description, salary, contact_phone, contact_whatsapp,
            qualification, min_experience_years, working_hours, status
        } = req.body;
        
        const job = await Job.findByPk(id);
        if (!job) {
            req.flash('error', 'الوظيفة غير موجودة');
            return res.redirect('/admin/jobs');
        }

        job.title = title;
        job.company_name = company_name;
        job.category_id = category_id;
        job.governorate_id = governorate_id;
        job.description = description;
        job.salary = salary || null;
        job.contact_phone = contact_phone;
        job.contact_whatsapp = contact_whatsapp || null;
        job.qualification = qualification || null;
        job.min_experience_years = min_experience_years ? parseInt(min_experience_years) : null;
        job.working_hours = working_hours || null;
        job.status = status || job.status;

        if (req.file) {
            job.image_url = `/uploads/jobs/${req.file.filename}`;
        }

        await job.save();

        req.flash('success', 'تم تحديث الوظيفة بنجاح');
        res.redirect('/admin/jobs');
    } catch (error) {
        console.error('Admin Jobs Update Error:', error);
        req.flash('error', 'حدث خطأ أثناء تحديث الوظيفة');
        res.redirect(`/admin/jobs/${req.params.id}/edit`);
    }
};

exports.destroy = async (req, res) => {
    try {
        const { id } = req.params;
        await Job.destroy({ where: { id } });
        req.flash('success', 'تم حذف الوظيفة بنجاح');
        res.redirect('/admin/jobs');
    } catch (error) {
        console.error('Admin Jobs Delete Error:', error);
        req.flash('error', 'حدث خطأ أثناء حذف الوظيفة');
        res.redirect('/admin/jobs');
    }
};
