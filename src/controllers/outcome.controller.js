const { Application, Job, EmploymentOutcome } = require('../models');

exports.showSurvey = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findOne({
            where: { id: applicationId, user_id: req.user.id },
            include: [{ model: Job }]
        });

        if (!application) {
            req.flash('error', 'التقديم غير موجود أو ليس لديك صلاحية.');
            return res.redirect('/user/dashboard');
        }

        // Check if already surveyed
        const existingOutcome = await EmploymentOutcome.findOne({
            where: { application_id: application.id }
        });

        if (existingOutcome) {
            req.flash('success', 'لقد قمت بالإجابة على هذا الاستبيان مسبقاً. شكراً لك!');
            return res.redirect('/user/dashboard');
        }

        res.render('pages/user/survey', {
            title: 'استبيان نتيجة التوظيف',
            path: '/user/survey',
            application
        });
    } catch (error) {
        console.error('Survey Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.submitSurvey = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { outcome, via_platform, notes } = req.body;

        const application = await Application.findOne({
            where: { id: applicationId, user_id: req.user.id },
            include: [{ model: Job }]
        });

        if (!application) return res.redirect('/user/dashboard');

        // Create outcome
        const newOutcome = await EmploymentOutcome.create({
            application_id: application.id,
            job_id: application.job_id,
            user_id: req.user.id,
            outcome,
            via_platform: outcome === 'hired' ? (via_platform === 'true') : null,
            notes
        });

        // Update Job Hired Count if hired via platform
        if (outcome === 'hired' && via_platform === 'true') {
            await application.Job.increment('hired_count');
        }

        // Set next reminder logic if still waiting
        if (outcome === 'waiting' || outcome === 'no_contact') {
            const nextReminder = new Date();
            nextReminder.setDate(nextReminder.getDate() + 15);
            newOutcome.next_reminder_at = nextReminder;
            await newOutcome.save();
        }

        req.flash('success', 'تم استلام ردك بنجاح! شكراً لمساعدتنا في تحسين المنصة.');
        res.redirect('/user/dashboard');
    } catch (error) {
        console.error('Submit Survey Error:', error);
        req.flash('error', 'حدث خطأ أثناء حفظ الاستبيان.');
        res.redirect('back');
    }
};
