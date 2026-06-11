const cron = require('node-cron');
const { Job } = require('../models');
const { Op } = require('sequelize');

// Run daily at midnight
const startExpireJobsJob = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('🔄 [CRON] Running Expire Jobs Check...');
        try {
            const now = new Date();

            // 1. Expire jobs that passed their expires_at date
            const [expiredCount] = await Job.update(
                { status: 'expired' },
                { 
                    where: { 
                        status: 'published',
                        expires_at: { [Op.lte]: now }
                    }
                }
            );

            // 2. Archive jobs that have been expired for more than 60 days
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

            const [archivedCount] = await Job.update(
                { status: 'archived' },
                {
                    where: {
                        status: 'expired',
                        expires_at: { [Op.lte]: sixtyDaysAgo }
                    }
                }
            );

            console.log(`✅ [CRON] Expired ${expiredCount} jobs. Archived ${archivedCount} jobs.`);
        } catch (error) {
            console.error('❌ [CRON] Expire Jobs Job Error:', error);
        }
    });
};

module.exports = startExpireJobsJob;
