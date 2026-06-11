const { Category, Job, Governorate } = require('../models');

exports.index = async (req, res) => {
    try {
        // Fetch all categories to show on homepage
        const categoryInstances = await Category.findAll({
            where: { is_active: true },
            order: [['sort_order', 'ASC']]
        });

        const categories = [];
        for (const cat of categoryInstances) {
            const catData = cat.toJSON();
            catData.jobs_count = await Job.count({
                where: { category_id: cat.id, status: 'published' }
            });
            categories.push(catData);
        }

        // Fetch latest published jobs
        const latestJobs = await Job.findAll({
            where: { status: 'published' },
            include: [
                { model: Category, as: 'category' },
                { model: Governorate, as: 'governorate' }
            ],
            order: [['published_at', 'DESC']],
            limit: 5
        });

        // Fetch all governorates for search form
        const governorates = await Governorate.findAll({
            order: [['sort_order', 'ASC'], ['name', 'ASC']]
        });

        // Optional: Fetch basic stats for the trusted section (or use dummy data for now)
        // Here we pass locals for the view to use
        
        res.render('pages/home', {
            title: 'الرئيسية',
            path: '/',
            categories,
            jobs: latestJobs,
            governorates
        });
    } catch (error) {
        console.error('Home controller error:', error);
        res.status(500).send('Server Error');
    }
};

exports.about = (req, res) => {
    res.render('pages/about', {
        title: 'من نحن',
        path: '/about'
    });
};

exports.faq = (req, res) => {
    res.render('pages/faq', {
        title: 'الأسئلة الشائعة',
        path: '/faq'
    });
};
