const cron = require('node-cron');
const https = require('https');
const { TelegramChannel, Job, Category, Governorate } = require('../models');
const grokService = require('../services/grok.service');
const deduplicationService = require('../services/deduplication.service');

// Cache to prevent duplicate processing within the same run
const recentScrapes = new Set();

/**
 * Scrape a public Telegram channel using its web preview HTML
 * Automatically decomposes grouped photo albums (e.g. 10 photos) into individual jobs!
 * @param {string} username The channel username (e.g. @jobs_egypt or https://t.me/jobs_egypt)
 * @returns {Promise<Array<Object>>} Array of individual job items
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
        console.log(`📡 [Telegram Scraper] Fetching channel: ${url}`);

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

                    // Main message ID (e.g. "opp_2026/189")
                    let mainId = null;
                    const idMatch = messageHtml.match(/data-post="([^"]+)"/);
                    if (idMatch && idMatch[1]) {
                        mainId = idMatch[1];
                    }

                    // Extract text
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

                    // Find all photo wraps in this message (handles single photos and albums of 10+ photos)
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
                        // If it's an album or contains photos, add each photo as a separate job item!
                        photosInMessage.forEach((p, idx) => {
                            items.push({
                                telegram_message_id: p.telegram_message_id || (mainId ? `${mainId}_${idx + 1}` : null),
                                text: text,
                                imageUrl: p.imageUrl
                            });
                        });
                    } else if (text.length > 25) {
                        // Text-only job
                        items.push({
                            telegram_message_id: mainId,
                            text: text,
                            imageUrl: null
                        });
                    }
                }

                console.log(`📥 [Telegram Scraper] Successfully extracted ${items.length} individual items/photos from @${cleanUsername}`);
                resolve(items);
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
            
            // 1. Fetch raw messages and photos
            const rawItems = await scrapeTelegramChannel(channel.channel_username);
            channelResult.fetched = rawItems.length;
            
            if (rawItems.length === 0) {
                results.push(channelResult);
                continue;
            }

            // 2. Take the latest 15 items (newest first)
            const recentItems = rawItems.slice(-15).reverse();
            
            for (const item of recentItems) {
                const text = item.text;
                const imageUrl = item.imageUrl;
                const msgId = item.telegram_message_id;

                // --- 1. FAST DATABASE DEDUPLICATION (Saves AI Quota & Time) ---
                if (msgId) {
                    const alreadyImported = await Job.findOne({ where: { telegram_message_id: msgId } });
                    if (alreadyImported) {
                        console.log(`⏩ [Telegram Cron] Post ${msgId} already exists in DB. Skipping.`);
                        channelResult.duplicates++;
                        continue;
                    }
                }

                // Memory cache skip
                const shortHash = (msgId || '') + (imageUrl ? imageUrl.substring(imageUrl.length - 20) : text.substring(0, 50));
                if (recentScrapes.has(shortHash)) {
                    channelResult.duplicates++;
                    continue;
                }
                recentScrapes.add(shortHash);
                if (recentScrapes.size > 2000) recentScrapes.clear();

                // Post number from msgId (e.g. "189" from "opp_2026/189")
                const postNum = msgId && msgId.includes('/') ? msgId.split('/')[1] : '';

                // --- 2. Process with AI or Smart Heuristic Rule Engine ---
                console.log(`🧠 [Processing] Parsing post ${msgId || ''} (@${channel.channel_username})... Has Image: ${imageUrl ? 'Yes' : 'No'}`);
                try {
                    const extractedData = await grokService.extractJobData(text, imageUrl, {
                        channelName: channel.channel_name,
                        postNum
                    });
                    
                    extractedData.source = 'telegram';
                    extractedData.telegram_message_id = msgId;
                    extractedData.telegram_raw_text = text || (imageUrl ? `وظيفة معلنة بالصورة: ${imageUrl}` : '');
                    if (imageUrl) {
                        extractedData.image_url = imageUrl;
                    }

                    const cleanUser = channel.channel_username.replace('@', '');
                    extractedData.telegram_message_url = postNum ? `https://t.me/${cleanUser}/${postNum}` : `https://t.me/${cleanUser}`;
                    
                    // --- 3. Content deduplication check ---
                    const duplicateResult = await deduplicationService.isDuplicate(extractedData);
                    if (duplicateResult.isDuplicate) {
                        console.log(`⚠️ [Deduplication] Job rejected as duplicate (${duplicateResult.matchLevel}).`);
                        channelResult.duplicates++;
                        continue;
                    }

                    // --- 4. Match Category ---
                    let category_id = 1;
                    if (extractedData.suggested_category_slug) {
                        const matchedCat = allCategories.find(c => c.slug === extractedData.suggested_category_slug);
                        if (matchedCat) category_id = matchedCat.id;
                    }

                    // --- 5. Match Governorate ---
                    let governorate_id = 1;
                    if (extractedData.suggested_governorate_slug) {
                        const matchedGov = allGovernorates.find(g => g.slug === extractedData.suggested_governorate_slug);
                        if (matchedGov) governorate_id = matchedGov.id;
                    } else if (extractedData.governorate) {
                        const matchedGovByName = allGovernorates.find(g => g.name.includes(extractedData.governorate) || extractedData.governorate.includes(g.name));
                        if (matchedGovByName) governorate_id = matchedGovByName.id;
                    }

                    // --- 6. Generate Unique Slug ---
                    const rawTitle = (extractedData.title || (postNum ? `إعلان وظيفة #${postNum}` : 'وظيفة جديدة')).trim();
                    const safeSlug = rawTitle.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').substring(0, 45);
                    const jobSlug = `${safeSlug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                    // --- 7. Save Job as 'pending' for Admin Review ---
                    await Job.create({
                        title: rawTitle,
                        slug: jobSlug,
                        description: extractedData.description || text || 'تفاصيل وشروط الوظيفة موضحة بالكامل في صورة الإعلان والبوستر المرفق أعلاه.',
                        requirements: extractedData.requirements || null,
                        company_name: extractedData.company_name || 'شركة معلنة في البوستر',
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
                        telegram_raw_text: extractedData.telegram_raw_text,
                        source: 'telegram',
                        status: 'pending',
                        posted_by: null
                    });
                    
                    console.log(`✅ [Telegram Cron] Saved pending job: "${rawTitle}"`);
                    channelResult.added++;
                    
                } catch (procError) {
                    console.error('❌ [Telegram Processing Error]:', procError.message);
                    channelResult.errors.push(procError.message);
                }
            }
            
            // 8. Update channel statistics in DB
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
        cron.schedule('0 */2 * * *', () => {
            console.log('⏰ Scheduled Telegram Cron Triggered');
            pullJobsFromTelegram();
        });
        console.log('⏰ Telegram Puller Cron Job Initialized (Runs automatically every 2 hours).');
    },
    triggerManualPull: pullJobsFromTelegram
};
