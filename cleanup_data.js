const { 
    User, 
    Job, 
    Role, 
    Application, 
    EmploymentOutcome, 
    JobContactUnlock, 
    SavedJob, 
    ViewedJob, 
    Report, 
    Notification, 
    TelegramImport,
    sequelize 
} = require('./src/models');
const { Op } = require('sequelize');

(async () => {
    try {
        console.log('🧹 بدء عملية الحذف للمستخدمين المسجلين والوظائف المنشورة فقط...');

        // 1. Get published jobs
        const publishedJobs = await Job.findAll({ where: { status: 'published' } });
        const publishedJobIds = publishedJobs.map(j => j.id);
        console.log(`📌 عدد الوظائف المنشورة المطلوب حذفها: ${publishedJobIds.length}`);

        // 2. Get non-admin users (exclude admin@forsa.com and 01000000000)
        const nonAdminUsers = await User.findAll({
            where: {
                [Op.and]: [
                    { phone: { [Op.ne]: '01000000000' } },
                    { email: { [Op.ne]: 'admin@forsa.com' } }
                ]
            }
        });
        const nonAdminUserIds = nonAdminUsers.map(u => u.id);
        console.log(`📌 عدد المستخدمين المسجلين المطلوب حذفهم: ${nonAdminUserIds.length}`);

        // 3. Clean up child records to avoid FK issues
        if (publishedJobIds.length > 0 || nonAdminUserIds.length > 0) {
            // Unlink Telegram imports
            if (publishedJobIds.length > 0) {
                await TelegramImport.update(
                    { job_id: null },
                    { where: { job_id: { [Op.in]: publishedJobIds } } }
                );
            }

            // Delete EmploymentOutcomes
            await EmploymentOutcome.destroy({
                where: {
                    [Op.or]: [
                        publishedJobIds.length ? { job_id: { [Op.in]: publishedJobIds } } : null,
                        nonAdminUserIds.length ? { user_id: { [Op.in]: nonAdminUserIds } } : null
                    ].filter(Boolean)
                }
            });

            // Delete JobContactUnlocks
            await JobContactUnlock.destroy({
                where: {
                    [Op.or]: [
                        publishedJobIds.length ? { job_id: { [Op.in]: publishedJobIds } } : null,
                        nonAdminUserIds.length ? { user_id: { [Op.in]: nonAdminUserIds } } : null
                    ].filter(Boolean)
                }
            });

            // Delete Applications
            await Application.destroy({
                where: {
                    [Op.or]: [
                        publishedJobIds.length ? { job_id: { [Op.in]: publishedJobIds } } : null,
                        nonAdminUserIds.length ? { user_id: { [Op.in]: nonAdminUserIds } } : null
                    ].filter(Boolean)
                }
            });

            // Delete SavedJobs
            await SavedJob.destroy({
                where: {
                    [Op.or]: [
                        publishedJobIds.length ? { job_id: { [Op.in]: publishedJobIds } } : null,
                        nonAdminUserIds.length ? { user_id: { [Op.in]: nonAdminUserIds } } : null
                    ].filter(Boolean)
                }
            });

            // Delete ViewedJobs
            await ViewedJob.destroy({
                where: {
                    [Op.or]: [
                        publishedJobIds.length ? { job_id: { [Op.in]: publishedJobIds } } : null,
                        nonAdminUserIds.length ? { user_id: { [Op.in]: nonAdminUserIds } } : null
                    ].filter(Boolean)
                }
            });

            // Delete Reports
            await Report.destroy({
                where: {
                    [Op.or]: [
                        publishedJobIds.length ? { job_id: { [Op.in]: publishedJobIds } } : null,
                        nonAdminUserIds.length ? { user_id: { [Op.in]: nonAdminUserIds } } : null
                    ].filter(Boolean)
                }
            });

            // Delete Notifications for deleted users
            if (nonAdminUserIds.length > 0) {
                await Notification.destroy({
                    where: { user_id: { [Op.in]: nonAdminUserIds } }
                });
            }
        }

        // 4. Delete the published jobs
        if (publishedJobIds.length > 0) {
            const deletedJobs = await Job.destroy({
                where: { id: { [Op.in]: publishedJobIds } }
            });
            console.log(`✅ تم حذف ${deletedJobs} وظيفة منشورة بنجاح.`);
        }

        // 5. Delete the non-admin registered users
        if (nonAdminUserIds.length > 0) {
            const deletedUsers = await User.destroy({
                where: { id: { [Op.in]: nonAdminUserIds } }
            });
            console.log(`✅ تم حذف ${deletedUsers} مستخدم مسجل بنجاح.`);
        }

        // 6. Verification
        const remainingUsers = await User.findAll({ include: [{ model: Role }] });
        console.log('\n--- المستخدمون المتبقون في النظام ---');
        remainingUsers.forEach(u => console.log(`• ${u.full_name} (${u.email || u.phone}) - الدور: ${u.Role?.name}`));

        const remainingJobs = await Job.findAll();
        console.log(`\n--- الوظائف المتبقية في النظام (${remainingJobs.length}) ---`);
        remainingJobs.forEach(j => console.log(`• ${j.title} [الحالة: ${j.status}]`));

        console.log('\n🎉 تمت العملية بنجاح وبأمان تام.');
    } catch (err) {
        console.error('❌ خطأ أثناء الحذف:', err);
    } finally {
        process.exit(0);
    }
})();
