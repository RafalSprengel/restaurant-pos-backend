const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');
const productController = require('../../controllers/productController');

const router = express.Router();

router.get('/getProducts', productController.getProducts);
router.get('/getSingleProduct/:id', productController.getSingleProduct);
router.post('/addProduct', authentMiddleware, authorize(['moderator', 'admin']), productController.addProduct);
router.delete('/deleteProduct/:id', authentMiddleware, authorize(['moderator', 'admin']), productController.deleteProduct);
router.put('/updateProduct/:id', authentMiddleware, authorize(['moderator', 'admin']), productController.updateProduct);

module.exports = router;
