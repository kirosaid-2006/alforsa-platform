const https = require('https');

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
        console.log('Fetching:', url);

        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                require('fs').writeFileSync('telegram_dump2.html', data);
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

                    // Extract image URL
                    let imageUrl = null;
                    const imgMatch = messageHtml.match(/class="tgme_widget_message_photo_wrap"[^>]*style="background-image:url\('([^']+)'\)"/);
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
                        messages.push({ text: text || 'لا يوجد نص، الرجاء الاعتماد على الصورة.', imageUrl });
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

async function run() {
    const msgs = await scrapeTelegramChannel('https://t.me/opp_2026');
    console.log(`Found ${msgs.length} messages.`);
    msgs.forEach((m, i) => console.log(`Msg ${i+1}: textLen=${m.text.length}, hasImage=${!!m.imageUrl}`));
}

run();
