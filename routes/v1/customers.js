const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/customerController');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');

router.get('/customer/', authentMiddleware, customerController.getCustomerDetails);
router.put('/customer/', authentMiddleware, customerController.updateCustomerDetails);

router.get('/', authentMiddleware, authorize(['member', 'moderator', 'admin']), customerController.getCustomers);
router.get('/:id', authentMiddleware, authorize(['member', 'moderator', 'admin']), customerController.getSingleCustomer);
router.put('/:id', authentMiddleware, authorize(['member', 'moderator', 'admin']), customerController.updateCustomer);
router.delete('/:id', authentMiddleware, authorize(['admin']), customerController.deleteCustomer);

module.exports = router;
