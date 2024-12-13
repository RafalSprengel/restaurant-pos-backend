const express = require('express');
const passport = require('passport');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authController = require('../../controllers/authController');

const router = express.Router();

router.post('/register-new-user', authController.registerNewCustomer);
router.post('/user-login', authController.loginUser);

router.post('/register-new-customer', authController.registerNewSystemUser);
router.post('/customer-login', authController.loginCustomer);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authentMiddleware, authController.logout);

router.get('/google', authController.googleAuth);
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.googleCallback);

router.get('/facebook', authController.facebookAuth);
router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), authController.facebookCallback);

module.exports = router;
