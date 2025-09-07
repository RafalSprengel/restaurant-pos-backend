const express = require('express');
const router = express.Router();
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');
const productController = require('../../controllers/productController');
const { upload, resizeImage } = require('../../middleware/upload');



router.get('/', productController.getProducts);
router.get('/:id', productController.getSingleProduct);

router.post('/', authentMiddleware, authorize(['moderator', 'admin']), upload.single('image'),resizeImage,  productController.addProduct);
router.put('/:id', authentMiddleware, authorize(['moderator', 'admin']), upload.single('image'), resizeImage, productController.updateProduct);
router.delete('/:id', authentMiddleware, authorize(['moderator', 'admin']), productController.deleteProduct);


module.exports = router;
