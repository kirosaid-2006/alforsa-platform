const { Job, Application, JobContactUnlock, ViewedJob, Category, Governorate, Report } = require('../models');
const { Op } = require('sequelize');

exports.index = async (req, res) => {
    try {
        const { q, cat, gov, qual, exp } = req.query;
        const whereClause = { status: 'published' };

        if (q) {
            whereClause[Op.or] = [
                { title: { [Op.iLike]: `%${q}%` } },
                { description: { [Op.iLike]: `%${q}%` } },
                { company_name: { [Op.iLike]: `%${q}%` } }
            ];
        }

        if (cat) whereClause.category_id = cat;
        if (gov) whereClause.governorate_id = gov;
        if (qual) whereClause.qualification = qual;
        if (exp) {
            if (exp === 'none') whereClause.min_experience_years = 0;
            else if (exp === '1') whereClause.min_experience_years = { [Op.gte]: 1 };
            else if (exp === '3') whereClause.min_experience_years = { [Op.gte]: 3 };
            else if (exp === '5') whereClause.min_experience_years = { [Op.gte]: 5 };
        }

        const jobs = await Job.findAll({
            where: whereClause,
            include: [
                { model: Category, as: 'category' },
                { model: Governorate, as: 'governorate' }
            ],
            order: [['published_at', 'DESC']]
        });

        const categories = await Category.findAll({ order: [['sort_order', 'ASC']] });
        const governorates = await Governorate.findAll({ order: [['sort_order', 'ASC']] });

        res.render('pages/jobs/index', {
            title: 'الوظائف المتاحة',
            path: '/jobs',
            jobs,
            categories,
            governorates,
            query: req.query
        });
    } catch (error) {
        console.error('Job List Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.show = async (req, res) => {
    try {
        const { slug } = req.params;
        const job = await Job.findOne({
            where: { slug, status: 'published' },
            include: [
                { model: Category, as: 'category' },
                { model: Governorate, as: 'governorate' }
            ]
        });

        if (!job) {
            return res.status(404).render('pages/404', { title: 'الوظيفة غير موجودة', path: '' });
        }

        const ipAddress = req.ip || req.connection.remoteAddress;
        const userId = req.user ? req.user.id : null;
        let hasViewed = false;

        if (userId) {
            const viewRecord = await ViewedJob.findOne({ where: { user_id: userId, job_id: job.id } });
            if (viewRecord) hasViewed = true;
        } else {
            const viewRecord = await ViewedJob.findOne({ where: { ip_address: ipAddress, job_id: job.id } });
            if (viewRecord) hasViewed = true;
        }

        if (!hasViewed) {
            await ViewedJob.create({
                user_id: userId,
                job_id: job.id,
                ip_address: ipAddress
            });
            await job.increment('views_count');
        }

        let hasApplied = false;
        if (req.user) {
            const application = await Application.findOne({
                where: { job_id: job.id, user_id: req.user.id }
            });
            if (application) hasApplied = true;
        }

        res.render('pages/jobs/detail', {
            title: job.title,
            path: '/jobs',
            job,
            hasApplied
        });
    } catch (error) {
        console.error('Job Detail Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.showCategory = async (req, res) => {
    try {
        const { slug } = req.params;
        const category = await Category.findOne({ where: { slug } });
        if (!category) return res.redirect('/jobs');

        const jobs = await Job.findAll({
            where: { category_id: category.id, status: 'published' },
            include: [
                { model: Category, as: 'category' },
                { model: Governorate, as: 'governorate' }
            ],
            order: [['published_at', 'DESC']]
        });

        const governorates = await Governorate.findAll({ order: [['sort_order', 'ASC']] });

        res.render('pages/jobs/index', {
            title: `وظائف ${category.name}`,
            path: '/jobs',
            categoryName: category.name,
            jobs,
            governorates,
            query: {}
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.apply = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'يجب تسجيل الدخول أولاً' });
        }

        const jobId = req.params.id;
        const job = await Job.findByPk(jobId);

        if (!job) {
            return res.status(404).json({ error: 'الوظيفة غير موجودة' });
        }

        const [application, created] = await Application.findOrCreate({
            where: { job_id: job.id, user_id: req.user.id },
            defaults: {
                job_id: job.id,
                user_id: req.user.id,
                status: 'submitted'
            }
        });

        if (created) {
            await job.increment('applications_count');
            await JobContactUnlock.create({
                user_id: req.user.id,
                job_id: job.id,
                application_id: application.id,
                ip_address: req.ip
            });

            return res.json({
                success: true,
                message: 'تم التقديم بنجاح! يمكنك الآن التواصل مع الشركة:',
                phone: job.contact_phone,
                whatsapp: job.contact_whatsapp,
                email: job.contact_email,
                image_url: job.image_url
            });
        } else {
            return res.json({
                success: true,
                message: 'لقد قمت بالتقديم على هذه الوظيفة مسبقاً.',
                phone: job.contact_phone,
                whatsapp: job.contact_whatsapp,
                email: job.contact_email,
                image_url: job.image_url
            });
        }
    } catch (error) {
        console.error('Job Apply Error:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء التقديم' });
    }
};

exports.showQuickSubmit = async (req, res) => {
    try {
        const categories = await Category.findAll({ order: [['sort_order', 'ASC']] });
        const governorates = await Governorate.findAll({ order: [['sort_order', 'ASC']] });
        res.render('pages/jobs/quick-submit', {
            title: 'أعلن عن وظيفة',
            path: '/jobs/quick-submit',
            categories,
            governorates
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.quickSubmit = async (req, res) => {
    try {
        const { company_name, contact_phone, contact_whatsapp, title, category_id, governorate_id, description } = req.body;

        if (!company_name || !contact_phone || !title || !category_id || !governorate_id) {
            req.flash('error', 'يرجى ملء جميع الحقول الإجبارية الفردية المطلوبة.');
            return res.redirect('/jobs/quick-submit');
        }

        const rawSlug = title.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-');
        const slug = `${rawSlug}-${Date.now()}`;

        const jobDescription = description && description.trim() !== '' 
            ? description.trim() 
            : `تطلب شركة/مصنع (${company_name}) شغل وظيفة (${title}). للمزيد والتواصل المباشر مع مسؤول التوظيف عبر الهاتف والواتساب الموضحين.`;

        await Job.create({
            title: title.trim(),
            slug,
            company_name: company_name.trim(),
            category_id: parseInt(category_id),
            governorate_id: parseInt(governorate_id),
            description: jobDescription,
            contact_phone: contact_phone.trim(),
            contact_whatsapp: contact_whatsapp ? contact_whatsapp.trim() : contact_phone.trim(),
            contact_info: `الهاتف: ${contact_phone.trim()}` + (contact_whatsapp ? ` | واتساب: ${contact_whatsapp.trim()}` : ''),
            image_url: req.file ? `/uploads/jobs/${req.file.filename}` : null,
            status: 'pending',
            source: 'web'
        });

        req.flash('success', 'تم إرسال الوظيفة بنجاح! سيتم مراجعتها من فريق الإدارة ونشرها على الموقع خلال ساعات قادمة.');
        res.redirect('/jobs/quick-submit');
    } catch (error) {
        console.error('Quick Submit Job Error:', error);
        req.flash('error', 'حدث خطأ أثناء إرسال الوظيفة. يرجى المحاولة مرة أخرى.');
        res.redirect('/jobs/quick-submit');
    }
};

exports.report = async (req, res) => {
    try {
        const { reason } = req.body;
        const jobId = req.params.id;

        if (!reason || !reason.trim()) {
            return res.status(400).json({ error: 'يرجى كتابة سبب الإبلاغ' });
        }

        await Report.create({
            job_id: jobId,
            user_id: req.user ? req.user.id : null,
            reason: reason.trim(),
            status: 'pending'
        });

        res.json({ success: true, message: 'تم إرسال البلاغ بنجاح للإدارة لمراجعته.' });
    } catch (error) {
        console.error('Report Error:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء إرسال البلاغ.' });
    }
};
