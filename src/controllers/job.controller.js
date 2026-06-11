const { Job, Category, Governorate, Application, JobContactUnlock, Report, ViewedJob } = require('../models');

// ... (Rest of imports and file content will be handled in chunks)

const { Op } = require('sequelize');

exports.index = async (req, res) => {
    try {
        const { q, gov, qual, exp, cat, page = 1 } = req.query;
        const limit = 20;
        const offset = (page - 1) * limit;

        const whereClause = { status: 'published' };

        // Search Query
        if (q) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${q}%` } },
                { company_name: { [Op.like]: `%${q}%` } }
            ];
        }

        // Category Filter
        if (cat) {
            whereClause.category_id = cat;
        }

        // Governorate Filter
        if (gov) {
            whereClause.governorate_id = gov;
        }

        // Qualification Filter
        if (qual) {
            whereClause.qualification = qual;
        }

        // Experience Filter
        if (exp) {
            if (exp === 'none') {
                whereClause.min_experience_years = 0;
            } else {
                whereClause.min_experience_years = { [Op.gte]: parseInt(exp) };
            }
        }

        const { count, rows } = await Job.findAndCountAll({
            where: whereClause,
            include: [
                { model: Category, as: 'category' },
                { model: Governorate, as: 'governorate' }
            ],
            order: [['published_at', 'DESC'], ['createdAt', 'DESC']],
            limit,
            offset
        });

        const categories = await Category.findAll({ order: [['sort_order', 'ASC']] });
        const governorates = await Governorate.findAll({ order: [['sort_order', 'ASC']] });

        res.render('pages/jobs/index', {
            title: 'تصفح الوظائف',
            path: '/jobs',
            jobs: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            categories,
            governorates,
            query: req.query
        });
    } catch (error) {
        console.error('Jobs List Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.show = async (req, res) => {
    try {
        const { slug } = req.params;

        const job = await Job.findOne({
            where: { slug },
            include: [
                { model: Category, as: 'category' },
                { model: Governorate, as: 'governorate' }
            ]
        });

        if (!job) {
            req.flash('error', 'الوظيفة المطلوبة غير موجودة أو تم إغلاقها.');
            return res.redirect('/jobs');
        }

        // Track unique views
        const userId = req.user ? req.user.id : null;
        const ipAddress = req.ip;

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

        // Check if user already applied
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
            query: {} // no active filters initially
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// AJAX POST Route
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

        // Check if already applied
        const [application, created] = await Application.findOrCreate({
            where: { job_id: job.id, user_id: req.user.id },
            defaults: {
                job_id: job.id,
                user_id: req.user.id,
                status: 'submitted'
            }
        });

        if (created) {
            // New application
            await job.increment('applications_count');
            
            // Record contact unlock
            await JobContactUnlock.create({
                user_id: req.user.id,
                job_id: job.id,
                application_id: application.id,
                ip_address: req.ip
            });

            return res.json({
                success: true,
                message: 'تم التقديم بنجاح! يمكنك الآن التواصل مع الشركة عبر الأرقام التالية:',
                phone: job.contact_phone,
                whatsapp: job.contact_whatsapp,
                email: job.contact_email
            });
        } else {
            // Already applied
            return res.json({
                success: true,
                message: 'لقد قمت بالتقديم على هذه الوظيفة مسبقاً.',
                phone: job.contact_phone,
                whatsapp: job.contact_whatsapp,
                email: job.contact_email
            });
        }
    } catch (error) {
        console.error('Job Apply Error:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء التقديم.' });
    }
};

exports.report = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'يجب تسجيل الدخول للإبلاغ عن وظيفة.' });
        }

        const jobId = req.params.id;
        const { reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.status(400).json({ success: false, message: 'يجب كتابة سبب البلاغ.' });
        }

        const job = await Job.findByPk(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'الوظيفة غير موجودة.' });
        }

        await Report.create({
            user_id: req.user.id,
            job_id: job.id,
            reason: reason.trim(),
            status: 'pending'
        });

        return res.json({ success: true, message: 'تم إرسال البلاغ بنجاح للإدارة. شكراً لمساعدتك.' });
    } catch (error) {
        console.error('Report Job Error:', error);
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء إرسال البلاغ.' });
    }
};
