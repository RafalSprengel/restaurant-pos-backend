const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const productCategoryController = require('../../controllers/categoryController');
const upload = require('../../middleware/upload');
const authorize = require('../../middleware/authorize');

const router = express.Router();
router.get('/', productCategoryController.getAllCategories);
router.get('/:id', productCategoryController.getSingleCategory);
router.post('/', authentMiddleware, authorize(['moderator', 'admin']), upload.single('image'), productCategoryController.addCategory);
router.put('/:id', authentMiddleware, authorize(['moderator', 'admin']), upload.single('image'), productCategoryController.updateCategory);
router.delete('/:id', authentMiddleware, authorize(['moderator', 'admin']), productCategoryController.deleteCategory);


module.exports = router;
