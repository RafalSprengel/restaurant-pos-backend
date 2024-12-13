const router = express.Router();

router.get('/getOrders', authentMiddleware, authorize(['member', 'moderator', 'admin']), ApiController.getOrders);
router.get('/getSingleOrder/:id', authentMiddleware, authorize(['member', 'moderator', 'admin']), ApiController.getSingleOrder);
router.delete('/deleteOrder/:id', authentMiddleware, authorize(['admin']), ApiController.deleteOrder);

module.exports = router;
