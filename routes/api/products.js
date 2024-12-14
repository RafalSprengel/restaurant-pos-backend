import express from 'express';
import authentMiddleware from '../middleware/authentMiddleware';
import authorize from '../middleware/authorize';
const router = express.Router();

router.get('/getProducts', ApiController.getProducts);
router.get('/getSingleProduct/:id', ApiController.getSingleProduct);
router.post('/addProduct', authentMiddleware, authorize(['moderator', 'admin']), ApiController.addProduct);
router.delete('/deleteProduct/:id', authentMiddleware, authorize(['moderator', 'admin']), ApiController.deleteProduct);
router.put('/updateProduct/:id', authentMiddleware, authorize(['moderator', 'admin']), ApiController.updateProduct);

module.exports = router;
