const fs = require('fs');

const advancedCss = `
/* ============================================================
   ADVANCED SAAS DESIGN (Stripe, Linear, Notion, Vercel)
   ============================================================ */

:root {
  /* Core Colors from Specs */
  --navy-900: #0b1220;
  --navy-800: #111d31;
  --navy-700: #1a2d4a;
  
  --amber-500: #f59e0b;
  --amber-400: #fbbf24;
  --amber-300: #fcd34d;
  --amber-50: #fffbeb;
  
  --white: #ffffff;
  --slate-50: #f8fafc;
  --slate-900: #0f172a;
  --slate-500: #64748b;
  --slate-200: #e2e8f0;
  
  --green-500: #10b981;
  --red-500: #ef4444;
  --orange-500: #f97316;
}

/* Base Overrides */
body {
  background-color: var(--slate-50);
  color: var(--slate-900);
  font-family: 'Cairo', sans-serif;
  animation: pageSlideIn 0.4s ease-out forwards;
}

/* Smooth Slide Transition Between Pages */
@keyframes pageSlideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Staggered FadeUp Entrance */
.saas-fade-up {
  opacity: 0;
  transform: translateY(20px);
  animation: saasFadeUpAnim 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes saasFadeUpAnim {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 80ms Stagger */
.stagger-1 { animation-delay: 80ms; }
.stagger-2 { animation-delay: 160ms; }
.stagger-3 { animation-delay: 240ms; }
.stagger-4 { animation-delay: 320ms; }
.stagger-5 { animation-delay: 400ms; }
.stagger-6 { animation-delay: 480ms; }
.stagger-7 { animation-delay: 560ms; }

/* Pulsing Dot Indicator */
.pulse-dot {
  position: relative;
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: var(--green-500);
  border-radius: 50%;
  margin-left: 8px; /* RTL */
}
.pulse-dot::after {
  content: '';
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  background-color: var(--green-500);
  border-radius: 50%;
  animation: pulseDotAnim 2s infinite;
  z-index: -1;
}
@keyframes pulseDotAnim {
  0% { transform: scale(1); opacity: 0.8; }
  70% { transform: scale(2.5); opacity: 0; }
  100% { transform: scale(3); opacity: 0; }
}

/* Floating Radial Glow Blobs (Dark Sections) */
.dark-section {
  position: relative;
  background-color: var(--navy-900);
  color: var(--white);
  overflow: hidden;
  z-index: 1;
}

.glow-blob-1, .glow-blob-2 {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: -1;
  opacity: 0.4;
  animation: floatGlow 15s ease-in-out infinite alternate;
}

.glow-blob-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, var(--navy-700), transparent);
  top: -100px; right: -100px;
}

.glow-blob-2 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, var(--amber-500), transparent);
  bottom: -50px; left: -50px;
  animation-delay: -5s;
}

@keyframes floatGlow {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 40px) scale(1.1); }
  100% { transform: translate(20px, -20px) scale(0.9); }
}

/* Dot Grid Texture Overlay */
.dot-grid-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
  z-index: -1;
  pointer-events: none;
}

/* Infinite Horizontal Ticker Pause on Hover */
.f-ticker-track {
  animation-play-state: running;
}
.f-ticker:hover .f-ticker-track {
  animation-play-state: paused;
}

/* Card Hover Elevate & Amber Border Slide */
.s-card {
  background: var(--white);
  border: 1px solid var(--slate-200);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.s-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 50%; right: 50%;
  height: 3px;
  background: var(--amber-500);
  transition: left 0.3s ease, right 0.3s ease;
}

.s-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.08), 0 4px 8px -4px rgba(0, 0, 0, 0.04);
}

.s-card:hover::after {
  left: 0; right: 0;
}

/* Input Focus Glow Ring */
.s-input {
  border: 1px solid var(--slate-200);
  background: var(--white);
  color: var(--slate-900);
  transition: all 0.2s ease;
}
.s-input:focus {
  outline: none;
  border-color: var(--amber-500);
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
}

/* Button Shadow Intensify */
.s-btn-primary {
  background: var(--amber-500);
  color: var(--navy-900);
  border: none;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.s-btn-primary:hover {
  background: var(--amber-400);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(245, 158, 11, 0.3);
}

/* Frosted Glass Blur Sticky Navbar */
.f-nav {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

/* Skeleton Shimmer Loading */
.skeleton-shimmer {
  background: #f6f7f8;
  background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
  background-repeat: no-repeat;
  background-size: 800px 100%; 
  animation-duration: 1.5s;
  animation-fill-mode: forwards; 
  animation-iteration-count: infinite;
  animation-name: shimmer;
  animation-timing-function: linear;
  border-radius: 4px;
}
@keyframes shimmer {
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
}

/* Password Strength Bar Transition */
.pwd-strength-bar {
  height: 4px;
  border-radius: 2px;
  background-color: var(--slate-200);
  transition: background-color 0.4s ease, width 0.4s ease;
  width: 0%;
}
.pwd-weak { width: 33%; background-color: var(--red-500); }
.pwd-medium { width: 66%; background-color: var(--orange-500); }
.pwd-strong { width: 100%; background-color: var(--green-500); }

/* Ensure secondary text has correct color */
.s-text-muted, p, .f-feature, .f-subtitle {
  color: var(--slate-500);
}
`;

const stylePath = 'public/css/style.css';
let content = fs.readFileSync(stylePath, 'utf8');
content += '\n' + advancedCss + '\n';
fs.writeFileSync(stylePath, content, 'utf8');
console.log('Advanced SaaS CSS appended successfully');
