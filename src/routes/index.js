const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');
const authRoutes = require('./auth.routes');
const { attachUser } = require('../middlewares/auth');

// Apply global middlewares
router.use(attachUser);

// Home route
router.get('/', homeController.index);
router.get('/about', homeController.about);
router.get('/faq', homeController.faq);

// Feature routes
router.use('/auth', authRoutes);

// Stubs for future implementation
router.use('/jobs', require('./jobs.routes'));
router.use('/user', require('./user.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/employer', require('./employer.routes'));

module.exports = router;
