const express = require('express');
const router = express.Router();
const stripeController = require('../../controllers/stripeController');

router.post('/create-checkout-session', express.json(), stripeController.createCheckoutSession);

router.get('/session-status', stripeController.getSessionStatus);

router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.webhook);

module.exports = router;
