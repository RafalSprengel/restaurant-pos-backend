const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');
const orderController = require('../../controllers/orderController');

const router = express.Router();

router.get('/', authentMiddleware, authorize(['member', 'moderator', 'admin']), orderController.getOrders);
router.get('/:id', authentMiddleware, authorize(['member', 'moderator', 'admin']), orderController.getSingleOrder);
router.delete('/:id', authentMiddleware, authorize(['admin']), orderController.deleteOrder);

module.exports = router;
