const { TelegramChannel, User } = require('../../models');

exports.index = async (req, res) => {
    try {
        const channels = await TelegramChannel.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        res.render('pages/admin/telegram', {
            title: 'إدارة قنوات تليجرام',
            path: '/admin/telegram',
            channels
        });
    } catch (error) {
        console.error('Telegram Channels Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.store = async (req, res) => {
    try {
        const { channel_name, channel_username, channel_id } = req.body;
        
        await TelegramChannel.create({
            channel_name,
            channel_username,
            channel_id: channel_id || channel_username, // Fallback if ID is unknown
            added_by: req.user.id
        });
        
        req.flash('success', 'تم إضافة القناة بنجاح.');
        res.redirect('/admin/telegram');
    } catch (error) {
        console.error('Add Telegram Channel Error:', error);
        req.flash('error', 'حدث خطأ أثناء الإضافة. تأكد من أن القناة غير مسجلة مسبقاً.');
        res.redirect('/admin/telegram');
    }
};

exports.toggleActive = async (req, res) => {
    try {
        const channel = await TelegramChannel.findByPk(req.params.id);
        if (channel) {
            channel.is_active = !channel.is_active;
            await channel.save();
            req.flash('success', channel.is_active ? 'تم تفعيل القناة.' : 'تم إيقاف القناة.');
        }
        res.redirect('/admin/telegram');
    } catch (error) {
        console.error('Toggle Channel Error:', error);
        req.flash('error', 'حدث خطأ أثناء تنفيذ الإجراء.');
        res.redirect('/admin/telegram');
    }
};

const telegramPullJob = require('../../jobs/telegramPull.job');

exports.testPull = async (req, res) => {
    try {
        const channel = await TelegramChannel.findByPk(req.params.id);
        if (!channel) {
            req.flash('error', 'القناة غير موجودة.');
            return res.redirect('/admin/telegram');
        }

        if (!channel.is_active) {
            req.flash('error', 'يجب تفعيل القناة أولاً لتتمكن من السحب منها.');
            return res.redirect('/admin/telegram');
        }

        // Trigger manual pull for this specific channel
        const results = await telegramPullJob.triggerManualPull(channel.channel_username);
        
        // Parse results for flash message
        if (results && results.length > 0) {
            const r = results[0];
            if (r.error) {
                req.flash('error', `خطأ في النظام: ${r.error}`);
            } else if (r.status === 'no_active_channels') {
                req.flash('warning', 'لم يتم العثور على قنوات مفعلة.');
            } else {
                let msg = `تم سحب ${r.fetched} رسالة. `;
                msg += `تمت إضافة ${r.added} وظيفة بنجاح. `;
                if (r.duplicates > 0) msg += `(تم تجاهل ${r.duplicates} مكررة). `;
                if (r.errors.length > 0) msg += `(أخطاء الذكاء الاصطناعي: ${r.errors.length})`;
                
                if (r.added > 0) {
                    req.flash('success', msg);
                } else {
                    req.flash('warning', msg);
                }
            }
        } else {
            req.flash('warning', 'لم يتم العثور على أي نتائج جديدة.');
        }

        res.redirect('/admin/telegram');
    } catch (error) {
        console.error('Test Pull Error:', error);
        req.flash('error', 'حدث خطأ أثناء محاولة السحب.');
        res.redirect('/admin/telegram');
    }
};
