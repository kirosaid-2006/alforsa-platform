require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();

// --- Configuration ---
const PORT = process.env.PORT || 3000;

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Middlewares
app.set('trust proxy', 1);
app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: '1d' // كاش للملفات الثابتة لسرعة التصفح
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session & Flash
app.use(session({
    secret: process.env.SESSION_SECRET || 'forsa-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(flash());

// Global Variables for Views
app.use((req, res, next) => {
    res.locals.success_messages = req.flash('success');
    res.locals.error_messages = req.flash('error');
    res.locals.warning_messages = req.flash('warning');
    res.locals.user = req.session.user || null;
    res.locals.pendingSurveys = 0;
    res.locals.notificationCount = 0;
    next();
});

// Routes
app.use('/', routes);

// Cron Jobs
const startOutcomeSurveyJob = require('./jobs/outcomeSurvey.job');
const startExpireJobsJob = require('./jobs/expireJobs.job');
const telegramPullJob = require('./jobs/telegramPull.job');
const runSeeders = require('./seeders');

// On Serverless (Vercel): لا نعيد عمل sync أو alter أو seeders مع كل ريكويست لتسريع الاستجابة
if (!process.env.VERCEL) {
    sequelize.sync({ force: false })
        .then(async () => {
            console.log('✅ Database synchronized.');
            await runSeeders(false);
            startOutcomeSurveyJob();
            startExpireJobsJob();
            telegramPullJob.init();
            
            app.listen(PORT, () => {
                console.log(`🚀 Forsa Server running at http://localhost:${PORT}`);
            });
        })
        .catch(err => {
            console.error('❌ Failed to sync database:', err);
        });
}

module.exports = app;
