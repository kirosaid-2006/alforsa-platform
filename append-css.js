const fs = require('fs');

const style = fs.readFileSync('public/css/style.css', 'utf8');
const theme = fs.readFileSync('public/css/fursa-theme.css', 'utf8');
const reset = fs.readFileSync('public/css/fursa-reset.css', 'utf8');

fs.writeFileSync('public/css/style.css', style + '\n' + theme + '\n' + reset, 'utf8');
console.log('Appended CSS successfully in UTF-8');
