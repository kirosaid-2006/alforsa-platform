const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/admin/dashboard.controller');
const jobsController = require('../controllers/admin/jobs.controller');
const analyticsController = require('../controllers/admin/analytics.controller');
const usersController = require('../controllers/admin/users.controller');
const telegramController = require('../controllers/admin/telegram.controller');
const { isAuthenticated, isRole, hasPermission } = require('../middlewares/auth');

// All admin routes require auth and admin/moderator/super_admin role
router.use(isAuthenticated);
router.use(isRole(['super_admin', 'admin', 'moderator']));

router.get('/', dashboardController.index);

const upload = require('../middlewares/upload');

// Jobs Management
router.get('/jobs', hasPermission('jobs.manage'), jobsController.index);
router.get('/jobs/pending', hasPermission('jobs.approve'), jobsController.pending);
router.post('/jobs/:id/approve', hasPermission('jobs.approve'), jobsController.approve);
router.post('/jobs/:id/reject', hasPermission('jobs.approve'), jobsController.reject);
router.get('/jobs/create', jobsController.showCreate);
router.post('/jobs/create', upload.uploadJobImage.single('job_image'), jobsController.store);
router.get('/jobs/:id/edit', hasPermission('jobs.manage'), jobsController.edit);
router.post('/jobs/:id/edit', hasPermission('jobs.manage'), upload.uploadJobImage.single('job_image'), jobsController.update);
router.post('/jobs/:id/delete', hasPermission('jobs.manage'), jobsController.destroy);

// Reports Management
router.get('/reports', hasPermission('jobs.manage'), jobsController.reports);
router.post('/reports/:id/resolve', hasPermission('jobs.manage'), jobsController.resolveReport);
router.post('/reports/:id/delete', hasPermission('jobs.manage'), jobsController.deleteReport);

// Analytics
router.get('/analytics', hasPermission('analytics.view'), analyticsController.index);

// Users Management
router.get('/users', hasPermission('users.view'), usersController.index);
router.get('/users/:id', hasPermission('users.view'), usersController.show);
router.post('/users/:id/toggle-ban', hasPermission('users.manage'), usersController.banUser);

// Telegram Channels Management
router.get('/telegram', hasPermission('telegram.manage'), telegramController.index);
router.post('/telegram', hasPermission('telegram.manage'), telegramController.store);
router.post('/telegram/:id/toggle', hasPermission('telegram.manage'), telegramController.toggleActive);
router.get('/telegram/:id/test-pull', hasPermission('telegram.manage'), telegramController.testPull);

module.exports = router;
