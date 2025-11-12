const express = require('express');
const passport = require('passport');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authController = require('../../controllers/authController');
const authorize = require('../../middleware/authorize');

const router = express.Router();

router.post('/register/customer', authController.registerCustomer);
router.post('/login/customer', authController.loginCustomer);

// router.post('/register/mgmt',authentMiddleware, authorize(['admin']), authController.registerMgmt);
router.post('/register/mgmt', authController.registerMgmt);
router.post('/login/mgmt', authController.loginMgmt);

router.get('/session', authentMiddleware, authController.session);
router.post('/logout', authentMiddleware, authController.logout);

router.post('/refresh-token', authController.refreshToken);

router.get('/google', authController.googleAuth);
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.googleCallback);

router.get('/facebook', authController.facebookAuth);
router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), authController.facebookCallback);

router.all('*', (_, res) => {
    res.status(404).json({ error: 'Not a valid API address' });
});

module.exports = router;