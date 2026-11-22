const cron = require('node-cron');
const https = require('https');
const { TelegramChannel, Job, Category, Governorate } = require('../models');
const grokService = require('../services/grok.service');
const deduplicationService = require('../services/deduplication.service');

/**
 * Scrape a public Telegram channel using its web preview HTML
 */
function scrapeTelegramChannel(username) {
    return new Promise((resolve) => {
        let cleanUsername = (username || '').trim().replace('@', '');
        if (cleanUsername.includes('t.me/')) {
            cleanUsername = cleanUsername.split('t.me/').pop();
        }
        if (cleanUsername.startsWith('s/')) {
            cleanUsername = cleanUsername.substring(2);
        }
        cleanUsername = cleanUsername.split('/')[0].split('?')[0];

        if (!cleanUsername) {
            console.warn('[Telegram Scraper] Empty username provided');
            return resolve([]);
        }

        const url = `https://t.me/s/${cleanUsername}`;
        console.log(`📡 [Telegram Scraper] Fetching: ${url}`);

        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache'
            },
            timeout: 12000
        };

        const req = https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    console.warn(`[Telegram Scraper] Channel ${cleanUsername} returned HTTP ${res.statusCode}`);
                    return resolve([]);
                }

                const messageChunks = data.split('<div class="tgme_widget_message ');
                const items = [];

                for (let i = 1; i < messageChunks.length; i++) {
                    const messageHtml = messageChunks[i];

                    let mainId = null;
                    const idMatch = messageHtml.match(/data-post="([^"]+)"/);
                    if (idMatch && idMatch[1]) {
                        mainId = idMatch[1];
                    }

                    let text = '';
                    const textMatch = messageHtml.match(/<div class="tgme_widget_message_text[^>]*>(.*?)<\/div>/s);
                    if (textMatch && textMatch[1]) {
                        text = textMatch[1];
                        text = text.replace(/<br\s*\/?>/gi, '\n');
                        text = text.replace(/<[^>]+>/g, '');
                        text = text.replace(/&quot;/g, '"')
                                   .replace(/&amp;/g, '&')
                                   .replace(/&lt;/g, '<')
                                   .replace(/&gt;/g, '>')
                                   .replace(/&#39;/g, "'")
                                   .replace(/&nbsp;/g, ' ');
                        text = text.trim();
                    }

                    const photoRegex = /class="[^"]*tgme_widget_message_photo_wrap[^"]*"[^>]*style="[^"]*background-image:url\('([^']+)'\)[^"]*"(?:[^>]*href="([^"]+)")?/gi;
                    let photoMatch;
                    const photosInMessage = [];

                    while ((photoMatch = photoRegex.exec(messageHtml)) !== null) {
                        const imgUrl = photoMatch[1];
                        const singleHref = photoMatch[2] || '';
                        
                        let subId = mainId;
                        if (singleHref) {
                            const postNumMatch = singleHref.match(/t\.me\/([^?]+)/);
                            if (postNumMatch && postNumMatch[1]) {
                                subId = postNumMatch[1];
                            }
                        }

                        photosInMessage.push({
                            telegram_message_id: subId,
                            imageUrl: imgUrl
                        });
                    }

                    if (photosInMessage.length > 0) {
                        photosInMessage.forEach((p, idx) => {
                            items.push({
                                telegram_message_id: p.telegram_message_id ? `${p.telegram_message_id}_img${idx + 1}` : null,
                                text: text,
                                imageUrl: p.imageUrl
                            });
                        });
                    } else if (text && text.length > 30) {
                        items.push({
                            telegram_message_id: mainId,
                            text: text,
                            imageUrl: null
                        });
                    }
                }

                console.log(`✅ [Telegram Scraper] Extracted ${items.length} raw job items from @${cleanUsername}`);
                resolve(items);
            });
        });

        req.on('error', (err) => {
            console.error(`❌ [Telegram Scraper] Network error for @${cleanUsername}:`, err.message);
            resolve([]);
        });

        req.on('timeout', () => {
            console.warn(`⏳ [Telegram Scraper] Timeout fetching @${cleanUsername}`);
            req.destroy();
            resolve([]);
        });
    });
}

/**
 * Main job execution function (handles single channel username or all active channels)
 */
async function pullJobsFromTelegram(targetUsername = null) {
    console.log('🔄 [Telegram Cron] Starting pull job...');

    try {
        let channelsToPull = [];

        if (targetUsername) {
            let cleanUser = targetUsername.trim().replace('@', '');
            if (cleanUser.includes('t.me/')) cleanUser = cleanUser.split('t.me/').pop();
            cleanUser = cleanUser.split('/')[0].split('?')[0];

            const ch = await TelegramChannel.findOne({
                where: { channel_username: { [require('sequelize').Op.iLike]: `%${cleanUser}%` } }
            });
            if (ch) {
                channelsToPull.push(ch);
            } else {
                channelsToPull.push({
                    channel_name: cleanUser,
                    channel_username: cleanUser,
                    save: async () => {}
                });
            }
        } else {
            channelsToPull = await TelegramChannel.findAll({
                where: { is_active: true }
            });
        }

        if (channelsToPull.length === 0) {
            console.log('ℹ️ [Telegram Cron] No channels to pull.');
            return [];
        }

        const allCategories = await Category.findAll();
        const allGovernorates = await Governorate.findAll();
        const defaultCategory = allCategories.find(c => c.slug === 'other' || c.slug === 'manual-labor') || allCategories[0];
        const defaultGov = allGovernorates.find(g => g.slug === 'cairo') || allGovernorates[0];

        const defaultCategoryId = defaultCategory ? defaultCategory.id : 1;
        const defaultGovernorateId = defaultGov ? defaultGov.id : 1;

        let totalAdded = 0;
        const results = [];

        for (const channel of channelsToPull) {
            const channelResult = {
                channel: channel.channel_name,
                username: channel.channel_username,
                fetched: 0,
                added: 0,
                duplicates: 0,
                errors: []
            };

            const items = await scrapeTelegramChannel(channel.channel_username);
            channelResult.fetched = items.length;

            for (const item of items) {
                const { text, imageUrl, telegram_message_id: msgId } = item;

                if (msgId) {
                    const alreadyImported = await Job.findOne({
                        where: { telegram_message_id: msgId }
                    });
                    if (alreadyImported) {
                        console.log(`⏩ [Telegram Cron] Post ${msgId} already exists in DB. Skipping.`);
                        channelResult.duplicates++;
                        continue;
                    }
                }

                const postNum = msgId && msgId.includes('/') ? msgId.split('/')[1] : (msgId || '');

                console.log(`🧠 [Processing] Parsing item ${msgId || ''} (@${channel.channel_username})... Image: ${imageUrl ? 'Yes' : 'No'}`);
                try {
                    const extractedData = await grokService.extractJobData(text, imageUrl, {
                        channelName: channel.channel_name,
                        postNum
                    });
                    
                    extractedData.source = 'telegram';
                    extractedData.telegram_message_id = msgId;
                    extractedData.telegram_raw_text = text || (imageUrl ? `وظيفة معلنة بالصورة` : '');
                    
                    if (imageUrl) {
                        extractedData.image_url = imageUrl;
                    }

                    if (extractedData.contact_phone || (text && text.length > 80)) {
                        const duplicateResult = await deduplicationService.isDuplicate(extractedData);
                        if (duplicateResult.isDuplicate) {
                            console.log(`⚠️ [Deduplication] Job rejected as duplicate (${duplicateResult.matchLevel}).`);
                            channelResult.duplicates++;
                            continue;
                        }
                    }

                    let category_id = defaultCategoryId;
                    if (extractedData.suggested_category_slug) {
                        const matchedCat = allCategories.find(c => c.slug === extractedData.suggested_category_slug);
                        if (matchedCat) category_id = matchedCat.id;
                    }

                    let governorate_id = defaultGovernorateId;
                    if (extractedData.suggested_governorate_slug) {
                        const matchedGov = allGovernorates.find(g => g.slug === extractedData.suggested_governorate_slug);
                        if (matchedGov) governorate_id = matchedGov.id;
                    } else if (extractedData.governorate) {
                        const matchedGovByName = allGovernorates.find(g => g.name.includes(extractedData.governorate) || extractedData.governorate.includes(g.name));
                        if (matchedGovByName) governorate_id = matchedGovByName.id;
                    }

                    const rawTitle = (extractedData.title || 'وظيفة جديدة متاحة').trim();
                    const safeSlug = rawTitle.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').substring(0, 45);
                    const jobSlug = `${safeSlug}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
                    const jobDescription = (extractedData.description || 'تفاصيل وشروط الوظيفة موضحة بالصورة المرفقة. اضغط تقديم لرؤية التفاصيل والتواصل.').trim();

                    const createdJob = await Job.create({
                        title: rawTitle,
                        slug: jobSlug,
                        description: jobDescription,
                        requirements: extractedData.requirements || null,
                        company_name: extractedData.company_name || 'شركة معلنة',
                        category_id,
                        governorate_id,
                        city: extractedData.city || null,
                        salary_min: extractedData.salary_min ? parseInt(extractedData.salary_min) : null,
                        salary_max: extractedData.salary_max ? parseInt(extractedData.salary_max) : null,
                        min_experience_years: extractedData.experience_years ? parseInt(extractedData.experience_years) : null,
                        qualification: ['none', 'diploma', 'institute', 'bachelors', 'masters', 'phd'].includes(extractedData.qualification) ? extractedData.qualification : 'none',
                        contact_phone: extractedData.contact_phone || null,
                        contact_whatsapp: extractedData.contact_whatsapp || extractedData.contact_phone || null,
                        contact_info: extractedData.contact_phone ? `الهاتف: ${extractedData.contact_phone}` : null,
                        image_url: extractedData.image_url || null,
                        telegram_message_id: extractedData.telegram_message_id || null,
                        telegram_message_url: null,
                        telegram_raw_text: null,
                        source: 'telegram',
                        status: 'published',
                        published_at: new Date(),
                        posted_by: null
                    });
                    
                    console.log(`✅ [Telegram Cron] Published clean job: "${rawTitle}" (ID: ${createdJob.id})`);
                    channelResult.added++;
                    
                } catch (procError) {
                    console.error('❌ [Telegram Processing Error]:', procError.message);
                    channelResult.errors.push(procError.message);
                }
            }
            
            channel.jobs_created = (channel.jobs_created || 0) + channelResult.added;
            channel.messages_count = (channel.messages_count || 0) + channelResult.fetched;
            channel.last_scraped_at = new Date();
            await channel.save();

            console.log(`🏁 [Telegram Cron] Finished @${channel.channel_username}: +${channelResult.added} added, ${channelResult.duplicates} skipped.`);
            results.push(channelResult);
            totalAdded += channelResult.added;
        }

        console.log(`🎉 [Telegram Cron] Pull finished! Added ${totalAdded} clean published jobs.`);
        return results;

    } catch (error) {
        console.error('❌ [Telegram Cron] Global Failure:', error);
        return [{ error: error.message }];
    }
}

/**
 * Initializes the automated cron job
 */
function init() {
    cron.schedule('0 */2 * * *', () => {
        pullJobsFromTelegram();
    });
    console.log('⏰ Telegram Puller Cron Job Initialized (Runs automatically every 2 hours).');
}

module.exports = {
    init,
    pullJobsFromTelegram,
    triggerManualPull: pullJobsFromTelegram,
    scrapeTelegramChannel
};
