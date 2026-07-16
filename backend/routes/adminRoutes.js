const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const adminController = require('../controllers/adminController');
const requireAuth = require('../middleware/requireAuth');
const loginLimiter = require('../middleware/loginLimiter');

// Public admin routes
router.get('/login', adminAuthController.getLogin);
router.post('/login', loginLimiter, adminAuthController.postLogin);
router.post('/logout', adminAuthController.postLogout);

// Protected admin routes
router.get('/dashboard', requireAuth, adminController.getDashboard);

module.exports = router;