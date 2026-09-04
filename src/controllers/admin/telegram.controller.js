const { TelegramChannel, User, Setting } = require('../../models');
const telegramPullJob = require('../../jobs/telegramPull.job');

exports.index = async (req, res) => {
    try {
        const channels = await TelegramChannel.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        const geminiSetting = await Setting.findOne({ where: { key: 'gemini_api_key' } });
        const geminiApiKey = geminiSetting ? geminiSetting.value : (process.env.GEMINI_API_KEY || '');

        res.render('pages/admin/telegram', {
            title: 'إدارة قنوات تليجرام',
            path: '/admin/telegram',
            channels,
            geminiApiKey
        });
    } catch (error) {
        console.error('Telegram Channels Error:', error);
        res.status(500).send('Server Error');
    }
};

exports.saveApiKey = async (req, res) => {
    try {
        const { gemini_api_key } = req.body;
        const [setting] = await Setting.findOrCreate({
            where: { key: 'gemini_api_key' },
            defaults: { key: 'gemini_api_key', value: (gemini_api_key || '').trim(), description: 'Google Gemini API Key' }
        });
        setting.value = (gemini_api_key || '').trim();
        await setting.save();
        req.flash('success', 'تم حفظ وتحديث مفتاح Google Gemini بنجاح.');
        res.redirect('/admin/telegram');
    } catch (error) {
        console.error('Save API Key Error:', error);
        req.flash('error', 'حدث خطأ أثناء حفظ المفتاح.');
        res.redirect('/admin/telegram');
    }
};

exports.store = async (req, res) => {
    try {
        let { channel_name, channel_username, channel_id } = req.body;
        
        if (!channel_name || !channel_username) {
            req.flash('error', 'يرجى إدخال اسم القناة ومعرفها.');
            return res.redirect('/admin/telegram');
        }

        // Clean and normalize channel_username
        let cleanUsername = channel_username.trim();
        if (cleanUsername.includes('t.me/')) {
            cleanUsername = cleanUsername.split('t.me/').pop();
        }
        if (cleanUsername.startsWith('s/')) {
            cleanUsername = cleanUsername.substring(2);
        }
        cleanUsername = cleanUsername.split('/')[0].split('?')[0].replace('@', '');

        const formattedUsername = '@' + cleanUsername;

        await TelegramChannel.create({
            channel_name: channel_name.trim(),
            channel_username: formattedUsername,
            channel_id: channel_id && channel_id.trim() !== '' ? channel_id.trim() : formattedUsername,
            added_by: req.user ? req.user.id : null
        });
        
        req.flash('success', `تم إضافة قناة ${channel_name} (${formattedUsername}) بنجاح.`);
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

        const results = await telegramPullJob.triggerManualPull(channel.channel_username);
        
        if (results && results.length > 0) {
            const r = results[0];
            if (r.error) {
                req.flash('error', `خطأ أثناء السحب: ${r.error}`);
            } else {
                let msg = `قناة (${channel.channel_name}): تم فحص ${r.fetched} رسالة وبوستر، `;
                msg += `وتمت إضافة ${r.added} وظيفة جديدة بنجاح لقائمة المراجعة! `;
                
                if (r.duplicates > 0) {
                    msg += `(تم تخطي ${r.duplicates} لأنها مسجلة مسبقاً). `;
                }
                if (r.errors && r.errors.length > 0) {
                    msg += `[تفاصيل أخطاء: ${r.errors.join(' | ')}] `;
                }
                
                if (r.added > 0) {
                    req.flash('success', `🎉 ${msg} تفقد صفحة "الوظائف المعلقة" لمراجعتها واعتمادها.`);
                } else if (r.duplicates > 0) {
                    req.flash('warning', `ℹ️ ${msg}`);
                } else {
                    req.flash('warning', `ℹ️ ${msg}`);
                }
            }
        } else {
            req.flash('warning', 'لم يتم العثور على رسائل وظائف جديدة في هذه القناة.');
        }

        res.redirect('/admin/telegram');
    } catch (error) {
        console.error('Test Pull Error:', error);
        req.flash('error', 'حدث خطأ أثناء محاولة السحب.');
        res.redirect('/admin/telegram');
    }
};

exports.pullAll = async (req, res) => {
    try {
        const results = await telegramPullJob.triggerManualPull();
        let totalFetched = 0;
        let totalAdded = 0;
        let totalDuplicates = 0;
        
        results.forEach(r => {
            totalFetched += (r.fetched || 0);
            totalAdded += (r.added || 0);
            totalDuplicates += (r.duplicates || 0);
        });

        if (totalAdded > 0) {
            req.flash('success', `🎉 اكتمل السحب الشامل: تم فحص ${totalFetched} رسالة وبوستر، وإضافة ${totalAdded} وظيفة جديدة للمراجعة بنجاح! تفقد صفحة الوظائف المعلقة.`);
        } else {
            req.flash('warning', `ℹ️ اكتمل السحب الشامل: تم فحص ${totalFetched} رسالة، وجميعها مسجلة مسبقاً.`);
        }
        res.redirect('/admin/telegram');
    } catch (error) {
        console.error('Pull All Channels Error:', error);
        req.flash('error', 'حدث خطأ أثناء سحب القنوات.');
        res.redirect('/admin/telegram');
    }
};

exports.destroy = async (req, res) => {
    try {
        const channel = await TelegramChannel.findByPk(req.params.id);
        if (channel) {
            await channel.destroy();
            req.flash('success', 'تم حذف القناة بنجاح.');
        }
        res.redirect('/admin/telegram');
    } catch (error) {
        console.error('Delete Channel Error:', error);
        req.flash('error', 'حدث خطأ أثناء حذف القناة.');
        res.redirect('/admin/telegram');
    }
};
