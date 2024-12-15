const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');
const orderController = require('../../controllers/orderController');

const router = express.Router();

router.get('/getOrders', authentMiddleware, authorize(['member', 'moderator', 'admin']), orderController.getOrders);
router.get('/getSingleOrder/:id', authentMiddleware, authorize(['member', 'moderator', 'admin']), orderController.getSingleOrder);
router.delete('/deleteOrder/:id', authentMiddleware, authorize(['admin']), orderController.deleteOrder);

module.exports = router;
