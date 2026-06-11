const { EmploymentOutcome, Category } = require('../../models');
const { Sequelize } = require('sequelize');

exports.index = async (req, res) => {
    try {
        // 1. Total Hired
        const totalHired = await EmploymentOutcome.count({
            where: { outcome: 'hired' }
        });

        // 2. Hired via Platform
        const platformHired = await EmploymentOutcome.count({
            where: { outcome: 'hired', via_platform: true }
        });

        // 3. Success Rate
        const totalOutcomes = await EmploymentOutcome.count();
        const successRate = totalOutcomes > 0 ? Math.round((totalHired / totalOutcomes) * 100) : 0;

        // 4. Survey Distribution
        const rejected = await EmploymentOutcome.count({ where: { outcome: 'rejected' } });
        const waiting = await EmploymentOutcome.count({ where: { outcome: 'waiting' } });
        const noContact = await EmploymentOutcome.count({ where: { outcome: 'no_contact' } });
        
        const surveyStats = totalOutcomes > 0 ? {
            hired: Math.round((totalHired / totalOutcomes) * 100),
            rejected: Math.round((rejected / totalOutcomes) * 100),
            waiting: Math.round((waiting / totalOutcomes) * 100),
            noContact: Math.round((noContact / totalOutcomes) * 100),
        } : null;

        // 5. Top Categories
        // Since sqlite doesn't support advanced joins with count easily in pure Sequelize, we'll do a simpler approach
        // We'll fetch all categories and count hired outcomes
        const categories = await Category.findAll();
        const topCategories = [];
        
        for (const cat of categories) {
            const count = await EmploymentOutcome.count({
                include: [{
                    model: require('../../models').Job,
                    as: 'job',
                    where: { category_id: cat.id }
                }],
                where: { outcome: 'hired' }
            });
            if (count > 0) {
                topCategories.push({ name: cat.name, hired_count: count });
            }
        }
        topCategories.sort((a, b) => b.hired_count - a.hired_count);

        res.render('pages/admin/analytics', {
            title: 'إحصائيات التوظيف',
            path: '/admin/analytics',
            totalHired,
            platformHired,
            successRate,
            surveyStats,
            topCategories: topCategories.slice(0, 5) // Top 5
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).send('Server Error');
    }
};
