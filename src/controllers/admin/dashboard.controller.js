const { Job, User, TelegramImport, TelegramChannel } = require('../../models');

exports.index = async (req, res) => {
    try {
        const pendingCount = await Job.count({ where: { status: 'pending' } });
        const activeJobsCount = await Job.count({ where: { status: 'published' } });
        const usersCount = await User.count();
        
        const recentImports = await TelegramImport.findAll({
            include: [{ model: TelegramChannel }],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        res.render('pages/admin/dashboard', {
            title: 'لوحة تحكم الإدارة',
            path: '/admin',
            pendingCount,
            activeJobsCount,
            usersCount,
            recentImports
        });
    } catch (error) {
        console.error('Admin Dashboard Error:', error);
        res.status(500).send('Server Error');
    }
};
