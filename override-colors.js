const fs = require('fs');

const overrideCss = `
/* ============================================================
   FORCED GLOBAL COLOR OVERRIDES (KILL ALL BLUE)
   ============================================================ */

:root {
    --primary: var(--amber-500) !important;
    --primary-hover: var(--amber-400) !important;
    --primary-light: var(--amber-50) !important;
    --blue-500: var(--navy-700) !important;
    --blue-600: var(--navy-800) !important;
    --blue-50: var(--slate-50) !important;
}

.f-hero {
    background: var(--navy-900) !important;
}

.btn-primary, .s-btn-primary {
    background: var(--amber-500) !important;
    color: var(--navy-900) !important;
    border: none !important;
    font-weight: 800 !important;
    box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3) !important;
}

.btn-primary:hover, .s-btn-primary:hover {
    background: var(--amber-400) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 15px rgba(245, 158, 11, 0.4) !important;
}

.f-title-accent {
    color: var(--amber-500) !important;
    text-shadow: 0 0 20px rgba(245, 158, 11, 0.3) !important;
}

/* More Animations for Cards */
.s-card {
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease !important;
}

.s-card:hover {
    transform: translateY(-8px) scale(1.01) !important;
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.05) !important;
    border-color: var(--amber-300) !important;
    z-index: 10;
}

/* Home page card specifics */
.f-cat-card {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
    border: 1px solid var(--slate-200) !important;
}
.f-cat-card:hover {
    transform: translateY(-8px) scale(1.02) !important;
    box-shadow: 0 20px 40px -10px rgba(245, 158, 11, 0.15) !important;
    border-color: var(--amber-400) !important;
}

.f-step-card {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
.f-step-card:hover {
    transform: translateY(-8px) !important;
    box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.1) !important;
}
`;

const stylePath = 'public/css/style.css';
let content = fs.readFileSync(stylePath, 'utf8');
content += '\n' + overrideCss + '\n';
fs.writeFileSync(stylePath, content, 'utf8');
console.log('Force overrides appended.');
