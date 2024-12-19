const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');

router.get('/get-customer', authentMiddleware, authorize(['member', 'moderator', 'admin']), userController.customer);
router.get('/get-customers', authentMiddleware, authorize(['member', 'moderator', 'admin']), userController.getCustomers);
router.delete('/delete-customer/:id', authentMiddleware, authorize(['admin']), userController.deleteCustomer);

module.exports = router;
