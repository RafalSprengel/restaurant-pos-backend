const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');
const productController = require('../../controllers/productController');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getSingleProduct);
router.post('/', authentMiddleware, authorize(['moderator', 'admin']), productController.addProduct);
router.put('/:id', authentMiddleware, authorize(['moderator', 'admin']), productController.updateProduct);
router.delete('/:id', authentMiddleware, authorize(['moderator', 'admin']), productController.deleteProduct);


module.exports = router;
