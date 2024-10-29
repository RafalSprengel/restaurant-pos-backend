const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// Registration and login routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Google login routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.googleCallback);

// Facebook login routes
router.get('/facebook', authController.facebookAuth);
router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), authController.facebookCallback);

module.exports = router;
