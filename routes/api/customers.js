const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/customerController');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');

router.get('/session', authentMiddleware, customerController.session);
router.get('/get-customers', authentMiddleware, authorize(['member', 'moderator', 'admin']), customerController.getCustomers);
router.delete('/delete-customer/:id', authentMiddleware, authorize(['admin']), customerController.deleteCustomer);

module.exports = router;
