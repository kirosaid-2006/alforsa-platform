const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { isGuest } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/register', isGuest, authController.showRegister);
router.post('/register', isGuest, upload.uploadCV.single('cv_file'), authController.register);

router.get('/login', isGuest, authController.showLogin);
router.post('/login', isGuest, authController.login);

router.get('/logout', authController.logout);

module.exports = router;
