const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');
const orderController = require('../../controllers/orderController');
const router = express.Router();

//==========  CUSTOMER PANEL  ==========//
router.get('/customer/', authentMiddleware,orderController.getCustomerOrdersAsCustomer)
router.put('/customer/:id', authentMiddleware, orderController.deleteCustomerOrderAsCustomer); //only mark as not visible for customer

//==========  ADMIN PANEL  ==========//
router.get('/order-types',orderController.getOrderTypesAsAdmin);
router.get('/', authentMiddleware, authorize(['member', 'moderator', 'admin']), orderController.getAllOrdersAsAdmin);
router.get('/:id', authentMiddleware, authorize(['member', 'moderator', 'admin']), orderController.getSingleOrderAsAdmin);
router.put('/:id', authentMiddleware, authorize(['member', 'moderator', 'admin']), orderController.updateOrderAsAdmin);
router.delete('/:id', authentMiddleware, authorize(['admin']), orderController.deleteOrderAsAdmin);

module.exports = router;
