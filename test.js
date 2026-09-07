const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

https.get(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`,
  (res) => {
    let data = '';

    res.on('data', chunk => data += chunk);

    res.on('end', () => {
      console.log(JSON.parse(data));
    });
  }
);