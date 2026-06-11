const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employer/dashboard.controller');
const { isAuthenticated, isRole } = require('../middlewares/auth');

router.use(isAuthenticated);
router.use(isRole('employer'));

router.get('/', employerController.index);
router.get('/jobs', employerController.index); // alias for dashboard list

const upload = require('../middlewares/upload');

router.get('/post-job', employerController.showPostJob);
router.post('/post-job', upload.uploadJobImage.single('job_image'), employerController.postJob);

module.exports = router;
