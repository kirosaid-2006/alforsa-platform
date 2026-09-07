const https = require('https');

const apiKey = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        try {
            const parsed = JSON.parse(data);
            if (parsed.models) {
                console.log('Available Models:');
                parsed.models.forEach(m => console.log(m.name));
            } else {
                console.log('Response:', parsed);
            }
        } catch (e) {
            console.log('Raw data:', data);
        }
    });
}).on('error', err => {
    console.error('Network Error:', err.message);
});
