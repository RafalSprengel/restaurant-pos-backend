const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const productCategoryController = require('../../controllers/productCategoryController');
const upload = require('../../middleware/upload');
const authorize = require('../../middleware/authorize');

const router = express.Router();
router.get('/getAllCategories', productCategoryController.getAllCategories);
router.get('/getSingleCategory/:id', productCategoryController.getSingleCategory);
router.delete('/deleteCategory/:id', authentMiddleware, authorize(['moderator', 'admin']), productCategoryController.deleteCategory);
router.post('/addCategory', authentMiddleware, authorize(['moderator', 'admin']), upload.single('image'), productCategoryController.addCategory);
router.put('/updateCategory/:id', authentMiddleware, authorize(['moderator', 'admin']), upload.single('image'), productCategoryController.updateCategory);

router.all('*', (req, res) => {
    res.status(404).json({ error: 'Not a valid API address' });
});

module.exports = router;
