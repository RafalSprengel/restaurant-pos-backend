const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/customerController');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');

router.all('/customer', authentMiddleware, authorize(['member', 'moderator', 'admin']), customerController.customer);
router.get('/getCustomers', authentMiddleware, authorize(['member', 'moderator', 'admin']), customerController.getCustomers);
router.delete('/deleteCustomer/:id', authentMiddleware, authorize(['admin']), customerController.deleteCustomer);

module.exports = router;
