const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');
const authentMiddleware = require('../middleware/authentMiddleware');

// Registration and login routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refreshToken', authController.refreshToken);
router.post('/logout', authentMiddleware, authController.logout);

// Google login routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.googleCallback);

// Facebook login routes
router.get('/facebook', authController.facebookAuth);
router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), authController.facebookCallback);

module.exports = router;
