const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { isAuthenticated } = require('../middlewares/auth');

const { uploadJobImage } = require('../middlewares/upload');

router.get('/', jobController.index);
router.get('/quick-submit', jobController.showQuickSubmit);
router.post('/quick-submit', uploadJobImage.single('job_image'), jobController.quickSubmit);

router.get('/category/:slug', jobController.showCategory);
router.get('/:slug', jobController.show);

// AJAX routes (requires auth)
router.post('/:id/apply', isAuthenticated, jobController.apply);
router.post('/:id/report', isAuthenticated, jobController.report);

module.exports = router;
