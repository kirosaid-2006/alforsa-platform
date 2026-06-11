const { User, Role, Application, Job, EmploymentOutcome } = require('../../models');
const { Op } = require('sequelize');

exports.index = async (req, res) => {
    try {
        const { search, qual, college } = req.query;
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { full_name: { [Op.like]: `%${search}%` } },
                { national_id: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }

        if (qual && qual !== '') {
            whereClause.qualification = qual;
        }

        if (college) {
            whereClause.college_institute = { [Op.like]: `%${college}%` };
        }

        const users = await User.findAll({
            where: whereClause,
            include: [{ model: Role }],
            order: [['createdAt', 'DESC']]
        });
        
        // Get unique colleges for the dropdown
        const uniqueColleges = await User.findAll({
            attributes: ['college_institute'],
            where: {
                college_institute: { [Op.ne]: null, [Op.ne]: '' }
            },
            group: ['college_institute'],
            order: [['college_institute', 'ASC']]
        });
        const collegeList = uniqueColleges.map(u => u.college_institute);
        
        res.render('pages/admin/users', {
            title: 'إدارة المستخدمين',
            path: '/admin/users',
            users,
            collegeList,
            query: req.query
        });
    } catch (error) {
        console.error('Users Management Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.show = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [{ model: Role }]
        });
        
        if (!user) {
            req.flash('error', 'المستخدم غير موجود.');
            return res.redirect('/admin/users');
        }

        // Fetch user's job applications
        const applications = await Application.findAll({
            where: { user_id: user.id },
            include: [{ model: Job, as: 'job' }],
            order: [['createdAt', 'DESC']]
        });

        // Fetch user's employment outcomes (surveys)
        const outcomes = await EmploymentOutcome.findAll({
            where: { user_id: user.id },
            include: [{ model: Job, as: 'job' }],
            order: [['createdAt', 'DESC']]
        });

        res.render('pages/admin/user-detail', {
            title: `ملف المستخدم: ${user.full_name}`,
            path: '/admin/users',
            userProfile: user,
            applications,
            outcomes
        });
    } catch (error) {
        console.error('User Detail Error:', error);
        req.flash('error', 'حدث خطأ أثناء جلب بيانات المستخدم.');
        res.redirect('/admin/users');
    }
};

exports.banUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            user.is_banned = !user.is_banned;
            await user.save();
            req.flash('success', user.is_banned ? 'تم حظر المستخدم بنجاح.' : 'تم رفع الحظر عن المستخدم بنجاح.');
        }
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Ban User Error:', error);
        req.flash('error', 'حدث خطأ أثناء تنفيذ الإجراء.');
        res.redirect('/admin/users');
    }
};

