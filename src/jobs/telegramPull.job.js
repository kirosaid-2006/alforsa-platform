const cron = require('node-cron');
const https = require('https');
const { Op } = require('sequelize');
const { TelegramChannel, Job, Category, Governorate } = require('../models');
const grokService = require('../services/grok.service');
const deduplicationService = require('../services/deduplication.service');

// Cache to prevent duplicate processing within the same run
const recentScrapes = new Set();

/**
 * Scrape a public Telegram channel using its web preview HTML
 * @param {string} username The channel username (e.g. @jobs_egypt or https://t.me/jobs_egypt)
 * @returns {Promise<Array<Object>>} Array of parsed message objects
 */
function scrapeTelegramChannel(username) {
    return new Promise((resolve) => {
        // Clean username format
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
        console.log(`📡 [Telegram Scraper] Fetching channel: https://t.me/s/${cleanUsername}`);

        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache'
            },
            timeout: 10000
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
                const messages = [];

                for (let i = 1; i < messageChunks.length; i++) {
                    const messageHtml = messageChunks[i];

                    // 1. Extract telegram_message_id (e.g. "channel_name/1234")
                    let telegram_message_id = null;
                    const idMatch = messageHtml.match(/data-post="([^"]+)"/);
                    if (idMatch && idMatch[1]) {
                        telegram_message_id = idMatch[1];
                    }

                    // 2. Extract image URL (high resolution photo wrap or background image)
                    let imageUrl = null;
                    const imgMatch = messageHtml.match(/class="[^"]*tgme_widget_message_photo_wrap[^"]*"[^>]*style="[^"]*background-image:url\('([^']+)'\)/i);
                    if (imgMatch && imgMatch[1]) {
                        imageUrl = imgMatch[1];
                    }

                    // 3. Extract message text
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

                    // Filter out short irrelevant messages or keep messages with jobs/images
                    if (text.length > 25 || imageUrl) {
                        messages.push({
                            telegram_message_id,
                            text: text || 'فرصة عمل معلنة عبر صورة البوستر المرفقة.',
                            imageUrl
                        });
                    }
                }

                console.log(`📥 [Telegram Scraper] Parsed ${messages.length} usable messages from @${cleanUsername}`);
                resolve(messages);
            });
        });

        req.on('error', (err) => {
            console.error(`[Telegram Scraper] Network error fetching @${cleanUsername}:`, err.message);
            resolve([]);
        });

        req.on('timeout', () => {
            req.destroy();
            console.warn(`[Telegram Scraper] Timeout fetching @${cleanUsername}`);
            resolve([]);
        });
    });
}

/**
 * Routine / Manual pull logic
 * @param {string} [specificChannelUsername=null] Optional username for targeted pull
 */
async function pullJobsFromTelegram(specificChannelUsername = null) {
    console.log('🤖 [Telegram Cron] Starting routine telegram pull...');
    const results = [];
    
    try {
        const query = { is_active: true };
        if (specificChannelUsername) {
            query.channel_username = specificChannelUsername;
        }
        
        const channels = await TelegramChannel.findAll({ where: query });
        
        if (channels.length === 0) {
            console.log('🤖 [Telegram Cron] No active channels found. Exiting.');
            return [{ channel: specificChannelUsername || 'all', status: 'no_active_channels', fetched: 0, added: 0, duplicates: 0, errors: [] }];
        }

        // Cache category and governorate lists for fast lookup
        const allCategories = await Category.findAll();
        const allGovernorates = await Governorate.findAll();

        for (const channel of channels) {
            console.log(`🤖 [Telegram Cron] Pulling from ${channel.channel_username}...`);
            let channelResult = { 
                channel: channel.channel_username, 
                channel_name: channel.channel_name,
                fetched: 0, 
                added: 0, 
                duplicates: 0, 
                errors: [] 
            };
            
            // 1. Fetch raw messages from the channel web page
            const rawMessages = await scrapeTelegramChannel(channel.channel_username);
            channelResult.fetched = rawMessages.length;
            
            if (rawMessages.length === 0) {
                results.push(channelResult);
                continue;
            }

            // 2. Take the latest 8 messages (newest first)
            const recentMessages = rawMessages.slice(-8).reverse();
            
            for (const msgObj of recentMessages) {
                const text = msgObj.text;
                const imageUrl = msgObj.imageUrl;
                const msgId = msgObj.telegram_message_id;

                // --- FAST DATABASE DEDUPLICATION FIRST (Saves AI Quota & Time) ---
                if (msgId) {
                    const alreadyImported = await Job.findOne({ where: { telegram_message_id: msgId } });
                    if (alreadyImported) {
                        console.log(`⏩ [Telegram Cron] Message ${msgId} already imported. Skipping.`);
                        channelResult.duplicates++;
                        continue;
                    }
                }

                // Memory cache skip
                const shortHash = (msgId || '') + text.substring(0, 80);
                if (recentScrapes.has(shortHash)) {
                    channelResult.duplicates++;
                    continue;
                }
                recentScrapes.add(shortHash);
                if (recentScrapes.size > 2000) recentScrapes.clear();

                // 3. Process with AI or Smart Fallback
                console.log(`🧠 [Processing] Extracting data from @${channel.channel_username}... Image: ${imageUrl ? 'Yes' : 'No'}`);
                try {
                    const extractedData = await grokService.extractJobData(text, imageUrl);
                    
                    extractedData.source = 'telegram';
                    extractedData.telegram_message_id = msgId;
                    extractedData.telegram_raw_text = text;
                    if (imageUrl && !extractedData.image_url) {
                        extractedData.image_url = imageUrl;
                    }

                    const cleanUser = channel.channel_username.replace('@', '');
                    const postNum = msgId && msgId.includes('/') ? msgId.split('/')[1] : '';
                    extractedData.telegram_message_url = postNum ? `https://t.me/${cleanUser}/${postNum}` : `https://t.me/${cleanUser}`;
                    
                    // 4. In-depth content deduplication check (phone / title / description)
                    const duplicateResult = await deduplicationService.isDuplicate(extractedData);
                    if (duplicateResult.isDuplicate) {
                        console.log(`⚠️ [Deduplication] Job rejected as duplicate (Match: ${duplicateResult.matchLevel}).`);
                        channelResult.duplicates++;
                        continue;
                    }

                    // 5. Match Category
                    let category_id = 1;
                    if (extractedData.suggested_category_slug) {
                        const matchedCat = allCategories.find(c => c.slug === extractedData.suggested_category_slug);
                        if (matchedCat) category_id = matchedCat.id;
                    }

                    // 6. Match Governorate
                    let governorate_id = 1;
                    if (extractedData.suggested_governorate_slug) {
                        const matchedGov = allGovernorates.find(g => g.slug === extractedData.suggested_governorate_slug);
                        if (matchedGov) governorate_id = matchedGov.id;
                    } else if (extractedData.governorate) {
                        const matchedGovByName = allGovernorates.find(g => g.name.includes(extractedData.governorate) || extractedData.governorate.includes(g.name));
                        if (matchedGovByName) governorate_id = matchedGovByName.id;
                    }

                    // 7. Generate Slug
                    const rawTitle = (extractedData.title || 'وظيفة جديدة').trim();
                    const safeSlug = rawTitle.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').substring(0, 50);
                    const jobSlug = `${safeSlug}-${Date.now()}`;

                    // 8. Save Job as 'pending' for Admin Review
                    await Job.create({
                        title: rawTitle,
                        slug: jobSlug,
                        description: extractedData.description || text,
                        requirements: extractedData.requirements || null,
                        company_name: extractedData.company_name || 'شركة غير معلنة',
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
                        telegram_message_url: extractedData.telegram_message_url || null,
                        telegram_raw_text: text,
                        source: 'telegram',
                        status: 'pending',
                        posted_by: null
                    });
                    
                    console.log(`✅ [Telegram Cron] Successfully pulled and created pending job: "${rawTitle}"`);
                    channelResult.added++;
                    
                } catch (procError) {
                    console.error('❌ [Telegram Processing Error]:', procError.message);
                    channelResult.errors.push(procError.message);
                }
            }
            
            // 9. Update channel statistics in DB
            channel.jobs_created = (channel.jobs_created || 0) + channelResult.added;
            channel.messages_count = (channel.messages_count || 0) + channelResult.fetched;
            channel.last_scraped_at = new Date();
            await channel.save();

            console.log(`🏁 [Telegram Cron] Finished @${channel.channel_username}: +${channelResult.added} jobs added, ${channelResult.duplicates} duplicates skipped.`);
            results.push(channelResult);
        }
        
        return results;
    } catch (error) {
        console.error('❌ [Telegram Cron Fatal Error]', error);
        return [{ error: error.message, fetched: 0, added: 0, duplicates: 0, errors: [error.message] }];
    }
}

module.exports = {
    init: () => {
        // Run every 2 hours at minute 0
        cron.schedule('0 */2 * * *', () => {
            console.log('⏰ Scheduled Telegram Cron Triggered');
            pullJobsFromTelegram();
        });
        console.log('⏰ Telegram Puller Cron Job Initialized (Runs automatically every 2 hours).');
    },
    triggerManualPull: pullJobsFromTelegram
};
