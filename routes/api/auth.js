const express = require('express');
const passport = require('passport');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authController = require('../../controllers/authController');

const router = express.Router();

router.post('/register-new-customer', authController.registerNewCustomer);
router.post('/login-customer', authController.loginCustomer);
router.post('/logout-customer', authentMiddleware, authController.logout);

router.post('/register-new-staff', authController.registerNewStaffMember);
router.post('/login-staff', authController.loginStaff);
router.post('/logout-staff', authentMiddleware, authController.logout);

router.post('/refresh-token', authController.refreshToken);

router.get('/google', authController.googleAuth);
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.googleCallback);

router.get('/facebook', authController.facebookAuth);
router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), authController.facebookCallback);

router.all('*', (_, res) => {
    res.status(404).json({ error: 'Not a valid API address' });
});

module.exports = router;
