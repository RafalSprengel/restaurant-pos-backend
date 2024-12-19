const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');
const userController = require('../../controllers/userController');
const router = express.Router();
router.get('/customer', authentMiddleware, authorize(['cusrtomer', 'member', 'moderator', 'admin']), userController.customer);
router.get('/get-customer', authentMiddleware, authorize(['member', 'moderator', 'admin']), userController.customer);
router.get('/get-customers', authentMiddleware, authorize(['member', 'moderator', 'admin']), userController.getCustomers);
router.delete('/delete-customer/:id', authentMiddleware, authorize(['admin']), userController.deleteCustomer);

module.exports = router;

router.all('/staff', authentMiddleware, authorize(['member', 'moderator', 'admin']), userController.staff);
router.get('/getStaff', authentMiddleware, authorize(['admin']), userController.getStaff);
router.get('/getStaffRoles', authentMiddleware, authorize(['admin']), userController.getStaffRoles);

module.exports = router;
