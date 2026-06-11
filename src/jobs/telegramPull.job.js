const cron = require('node-cron');
const https = require('https');
const { TelegramChannel, Job } = require('../models');
const grokService = require('../services/grok.service');
const deduplicationService = require('../services/deduplication.service');

// A Set to keep track of recently processed message snippets to avoid double processing in the same run
const recentScrapes = new Set();

/**
 * Scrape a public Telegram channel using its web preview HTML
 * @param {string} username The channel username (e.g. @jobs_egypt)
 * @returns {Promise<Array<string>>} Array of raw text messages
 */
function scrapeTelegramChannel(username) {
    return new Promise((resolve, reject) => {
        // Handle cases where the user inputs the full URL instead of just the username
        let cleanUsername = username.replace('@', '');
        if (cleanUsername.includes('t.me/')) {
            cleanUsername = cleanUsername.split('t.me/').pop();
        }
        if (cleanUsername.startsWith('s/')) {
            cleanUsername = cleanUsername.substring(2);
        }
        // Remove trailing slashes or queries just in case
        cleanUsername = cleanUsername.split('/')[0].split('?')[0];

        const url = `https://t.me/s/${cleanUsername}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    console.warn(`[Telegram Scraper] Channel ${username} returned status ${res.statusCode}`);
                    return resolve([]); // Graceful fail, just return empty array
                }

                // Match the entire message container to safely extract both text and image
                const messageChunks = data.split('<div class="tgme_widget_message ');
                const messages = [];

                // Skip the first chunk as it's the header before any message
                for (let i = 1; i < messageChunks.length; i++) {
                    const messageHtml = messageChunks[i];

                    // Extract telegram_message_id
                    let telegram_message_id = null;
                    const idMatch = messageHtml.match(/data-post="([^"]+)"/);
                    if (idMatch && idMatch[1]) {
                        telegram_message_id = idMatch[1];
                    }

                    // Extract image URL
                    let imageUrl = null;
                    const imgMatch = messageHtml.match(/class="[^"]*tgme_widget_message_photo_wrap[^"]*"[^>]*style="[^"]*background-image:url\('([^']+)'\)/);
                    if (imgMatch && imgMatch[1]) {
                        imageUrl = imgMatch[1];
                    }

                    // Extract text
                    let text = '';
                    const textMatch = messageHtml.match(/<div class="tgme_widget_message_text[^>]*>(.*?)<\/div>/s);
                    if (textMatch && textMatch[1]) {
                        text = textMatch[1];
                        // Clean up HTML tags and newlines
                        text = text.replace(/<br\s*\/?>/gi, '\n');
                        text = text.replace(/<[^>]+>/g, ''); // strip other tags like <a>, <b>
                        
                        // Decode basic HTML entities
                        text = text.replace(/&quot;/g, '"')
                                   .replace(/&amp;/g, '&')
                                   .replace(/&lt;/g, '<')
                                   .replace(/&gt;/g, '>')
                                   .replace(/&#39;/g, "'");

                        text = text.trim();
                    }

                    // Only care about substantial messages (jobs) or messages with images
                    if (text.length > 30 || imageUrl) {
                        messages.push({ 
                            telegram_message_id,
                            text: text || 'لا يوجد نص، الرجاء الاعتماد على الصورة.', 
                            imageUrl 
                        });
                    }
                }

                resolve(messages);
            });
        }).on('error', err => {
            console.error(`[Telegram Scraper] Error fetching ${username}:`, err.message);
            resolve([]); // Don't crash the cron
        });
    });
}

/**
 * Main polling logic to run every X minutes
 */
async function pullJobsFromTelegram(specificChannelUsername = null) {
    console.log('🤖 [Telegram Cron] Starting routine telegram pull...');
    const results = [];
    
    try {
        // 1. Get all active channels (or just one if specified)
        const query = { is_active: true };
        if (specificChannelUsername) {
            query.channel_username = specificChannelUsername;
        }
        
        const channels = await TelegramChannel.findAll({ where: query });
        
        if (channels.length === 0) {
            console.log('🤖 [Telegram Cron] No active channels found. Exiting.');
            return [{ channel: specificChannelUsername || 'all', status: 'no_active_channels' }];
        }

        for (const channel of channels) {
            console.log(`🤖 [Telegram Cron] Pulling from ${channel.channel_username}...`);
            let channelResult = { channel: channel.channel_username, fetched: 0, added: 0, duplicates: 0, errors: [] };
            
            // 2. Fetch raw messages
            const rawMessages = await scrapeTelegramChannel(channel.channel_username);
            channelResult.fetched = rawMessages.length;
            
            // 3. Keep only the latest 1 message to avoid hitting the 20 requests/day AI limit
            const recentMessages = rawMessages.slice(-1).reverse();
            
            for (const msgObj of recentMessages) {
                const text = msgObj.text;
                const imageUrl = msgObj.imageUrl;

                // Skip if we processed this exact text recently in memory
                const shortHash = text.substring(0, 100) + (imageUrl || '');
                if (!specificChannelUsername && recentScrapes.has(shortHash)) continue; // Only skip cache if NOT manual
                if (!specificChannelUsername) recentScrapes.add(shortHash);

                // Prevent memory leak
                if (recentScrapes.size > 1000) recentScrapes.clear();

                // 4. Send to AI to extract data
                console.log(`🧠 [AI] Processing message from ${channel.channel_username}... Image: ${imageUrl ? 'Yes' : 'No'}`);
                try {
                    const extractedData = await grokService.extractJobData(text, imageUrl);
                    
                    // Add source metadata
                    extractedData.source_type = 'telegram';
                    extractedData.source_url = `https://t.me/${channel.channel_username.replace('@', '')}`;
                    if (msgObj.telegram_message_id) extractedData.telegram_message_id = msgObj.telegram_message_id;
                    
                    // 5. Deduplication check
                    const duplicateResult = await deduplicationService.isDuplicate(extractedData);
                    
                    if (duplicateResult.isDuplicate) {
                        console.log('⚠️ [Deduplication] Job rejected as duplicate.');
                        channelResult.duplicates++;
                        continue; // Skip this one
                    }

                    // Map Category and Governorate
                    const { Category, Governorate } = require('../models');
                    
                    let category_id = 1; // Default
                    if (extractedData.suggested_category_slug) {
                        const cat = await Category.findOne({ where: { slug: extractedData.suggested_category_slug } });
                        if (cat) category_id = cat.id;
                    }

                    let governorate_id = 1; // Default
                    if (extractedData.suggested_governorate_slug) {
                        const gov = await Governorate.findOne({ where: { slug: extractedData.suggested_governorate_slug } });
                        if (gov) governorate_id = gov.id;
                    }

                    // Generate a slug for the job
                    const jobSlug = extractedData.title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-') + '-' + Date.now();

                    // 6. Save as Pending Job for Admin review
                    await Job.create({
                        ...extractedData,
                        category_id,
                        governorate_id,
                        slug: jobSlug,
                        status: 'pending', // Admins must review telegram pulls
                        employer_id: null // System-pulled job
                    });
                    
                    console.log('✅ [Telegram Cron] Successfully pulled and saved a new pending job.');
                    channelResult.added++;
                    
                } catch (aiError) {
                    console.error('❌ [AI Error]', aiError.message);
                    channelResult.errors.push(aiError.message);
                }
            }
            
            // Update the last scraped time for the channel
            channel.last_scraped_at = new Date();
            await channel.save();
            console.log(`🤖 [Telegram Cron] Finished ${channel.channel_username}. Added ${channelResult.added} jobs.`);
            results.push(channelResult);
        }
        
        return results;
    } catch (error) {
        console.error('❌ [Telegram Cron Error]', error);
        return [{ error: error.message }];
    }
}

// Export a function to initialize the cron job
module.exports = {
    init: () => {
        // Run every 2 hours at minute 0
        cron.schedule('0 */2 * * *', () => pullJobsFromTelegram());
        console.log('⏰ Telegram Puller Cron Job Initialized (Runs every 2 hours).');
        
        // Also run once on startup (after 5 seconds delay to let DB connect)
        setTimeout(() => pullJobsFromTelegram(), 5000);
    },
    // Expose for manual triggering
    triggerManualPull: pullJobsFromTelegram
};
