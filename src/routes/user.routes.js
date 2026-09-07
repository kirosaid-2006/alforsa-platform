const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const outcomeController = require('../controllers/outcome.controller');
const { isAuthenticated, isRole } = require('../middlewares/auth');

// All user routes require authentication and 'user' role
router.use(isAuthenticated);
router.use(isRole('user'));

router.get('/dashboard', userController.dashboard);
router.get('/my-applications', userController.myApplications);
router.get('/saved-jobs', userController.savedJobs);

router.get('/profile', userController.showProfile);
router.post('/profile', userController.updateProfile);

// Survey Routes
router.get('/survey/:applicationId', outcomeController.showSurvey);
router.post('/survey/:applicationId', outcomeController.submitSurvey);

module.exports = router;
