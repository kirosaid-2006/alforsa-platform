const https = require('https');

function scrapeTelegramChannel(username) {
    const url = `https://t.me/s/${username.replace('@', '')}`;
    console.log('Fetching:', url);

    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            // Regex to find message divs and their text
            // Note: Telegram uses <br/> for newlines in the HTML
            const messageRegex = /<div class="tgme_widget_message_text[^>]*>(.*?)<\/div>/gs;
            let match;
            const messages = [];

            while ((match = messageRegex.exec(data)) !== null) {
                let text = match[1];
                // Clean up HTML tags
                text = text.replace(/<br\s*\/?>/gi, '\n');
                text = text.replace(/<[^>]+>/g, ''); // strip other tags like <a>, <b>
                
                // Decode HTML entities (basic ones)
                text = text.replace(/&quot;/g, '"')
                           .replace(/&amp;/g, '&')
                           .replace(/&lt;/g, '<')
                           .replace(/&gt;/g, '>');

                messages.push(text.trim());
            }

            console.log(`Found ${messages.length} messages.`);
            if (messages.length > 0) {
                console.log('Last message:', messages[messages.length - 1]);
            }
        });
    }).on('error', err => {
        console.error('Error fetching telegram:', err.message);
    });
}

scrapeTelegramChannel('jobs_egypt'); // test with a known public channel
