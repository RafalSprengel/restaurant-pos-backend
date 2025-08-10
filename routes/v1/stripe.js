const express = require('express');
const identifyCustomer = require('../../middleware/identifyCustomer');
const router = express.Router();
const stripeController = require('../../controllers/stripeController');

router.post('/create-checkout-session', express.json(), identifyCustomer, stripeController.createCheckoutSession);

router.get('/session-status', stripeController.getSessionStatus);

module.exports = router;
