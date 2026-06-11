const cron = require('node-cron');
const { Application, EmploymentOutcome, User, Job } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('../services/notification.service');

// Run daily at 9:00 AM
const startOutcomeSurveyJob = () => {
    cron.schedule('0 9 * * *', async () => {
        console.log('🔄 [CRON] Running Outcome Survey Check Job...');
        try {
            // 1. Find applications older than 15 days with NO outcome
            const fifteenDaysAgo = new Date();
            fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

            // In Sequelize SQLite, doing complex LEFT JOIN where outcome IS NULL 
            // can sometimes be tricky without raw queries, so we fetch and filter
            
            const applications = await Application.findAll({
                where: {
                    createdAt: { [Op.lte]: fifteenDaysAgo },
                    status: { [Op.notIn]: ['rejected'] } // Exclude immediately rejected
                },
                include: [
                    { model: User, where: { consent_notifications: true } },
                    { model: Job },
                    { model: EmploymentOutcome, required: false }
                ]
            });

            let countNew = 0;
            for (const app of applications) {
                // If it doesn't have an outcome, it means they haven't filled the survey
                if (!app.EmploymentOutcome) {
                    // Send notification
                    await notificationService.createNotification(
                        app.user_id,
                        'survey_reminder',
                        'استبيان نتيجة التوظيف 📝',
                        `لقد مر 15 يوماً على تقديمك لوظيفة "${app.Job.title}". يرجى إخبارنا بالنتيجة.`,
                        `/user/survey/${app.id}`
                    );
                    
                    app.reminder_sent_at = new Date();
                    app.reminder_count += 1;
                    await app.save();
                    countNew++;
                }
            }

            // 2. Find outcomes marked as 'waiting' or 'no_contact' whose next_reminder_at is due
            const waitingOutcomes = await EmploymentOutcome.findAll({
                where: {
                    outcome: { [Op.in]: ['waiting', 'no_contact'] },
                    next_reminder_at: { [Op.lte]: new Date() }
                },
                include: [
                    { model: Application, include: [{ model: Job }] },
                    { model: User, where: { consent_notifications: true } }
                ]
            });

            let countFollowup = 0;
            for (const outcome of waitingOutcomes) {
                await notificationService.createNotification(
                    outcome.user_id,
                    'survey_reminder_followup',
                    'متابعة نتيجة التوظيف 📝',
                    `هل استجد أي جديد بخصوص تقديمك لوظيفة "${outcome.Application.Job.title}"؟`,
                    `/user/survey/${outcome.application_id}`
                );

                // Add another 15 days
                const nextReminder = new Date();
                nextReminder.setDate(nextReminder.getDate() + 15);
                outcome.next_reminder_at = nextReminder;
                outcome.reminder_count += 1;
                await outcome.save();
                countFollowup++;
            }

            console.log(`✅ [CRON] Sent ${countNew} new surveys, ${countFollowup} followups.`);
        } catch (error) {
            console.error('❌ [CRON] Outcome Survey Job Error:', error);
        }
    });
};

module.exports = startOutcomeSurveyJob;
