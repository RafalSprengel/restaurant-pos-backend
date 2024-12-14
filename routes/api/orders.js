import express from 'express';
import authentMiddleware from '../middleware/authentMiddleware';
import authorize from '../middleware/authorize';
import orderController from '../controllers/orderController';
const router = express.Router();

router.get('/getOrders', authentMiddleware, authorize(['member', 'moderator', 'admin']), orderController.getOrders);
router.get('/getSingleOrder/:id', authentMiddleware, authorize(['member', 'moderator', 'admin']), orderController.getSingleOrder);
router.delete('/deleteOrder/:id', authentMiddleware, authorize(['admin']), orderController.deleteOrder);

module.exports = router;
