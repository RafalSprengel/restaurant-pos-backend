const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/customerController');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');

//==========  CUSTOMER PANEL  ==========//
router.get('/customer/', authentMiddleware, customerController.getCustomerDetailsAsCustomer); // customer panel

//==========  ADMIN PANEL  ==========//
router.get('/', authentMiddleware, authorize(['member', 'moderator', 'admin']), customerController.getCustomersAsAdmin);
router.get('/:id', customerController.getSingleCustomerAsAdmin);
// router.get('/:id', authentMiddleware, authorize(['member', 'moderator', 'admin']), customerController.getSingleCustomerAsAdmin);
router.put('/:id', customerController.updateCustomerAsAdmin);
// router.put('/:id', authentMiddleware, authorize(['member', 'moderator', 'admin']), customerController.updateCustomerAsAdmin);
router.delete('/:id', authentMiddleware, authorize(['admin']), customerController.deleteCustomerAsAdmin);

module.exports = router;
