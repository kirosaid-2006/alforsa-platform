const fs = require('fs');
const stylePath = 'public/css/style.css';
const saasPath = 'public/css/saas-theme.css';
let content = fs.readFileSync(stylePath, 'utf8');
const saasContent = fs.readFileSync(saasPath, 'utf8');
content += '\n' + saasContent + '\n';
fs.writeFileSync(stylePath, content, 'utf8');
console.log('SaaS CSS appended successfully');
