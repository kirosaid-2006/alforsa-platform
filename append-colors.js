const fs = require('fs');

const userColors = `
/* USER PROVIDED COLORS FOR NEW DESIGN */
:root {
  --navy-900: #0b1220;
  --navy-800: #111d31;
  --navy-700: #1a2d4a;
  --amber-500: #f59e0b;
  --amber-400: #fbbf24;
  --amber-300: #fcd34d;
  --amber-50: #fffbeb;
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-400: #94a3b8;
  --slate-500: #64748b;
  --slate-900: #0f172a;
  --green-500: #10b981;
  --green-50: #ecfdf5;
  --blue-50: #eff6ff;
  --blue-500: #3b82f6;
  --white: #ffffff;
  --red-500: #ef4444;
}
`;

const stylePath = 'public/css/style.css';
let content = fs.readFileSync(stylePath, 'utf8');
// Append safely
content += '\n' + userColors + '\n';
fs.writeFileSync(stylePath, content, 'utf8');
console.log('Colors appended successfully');
