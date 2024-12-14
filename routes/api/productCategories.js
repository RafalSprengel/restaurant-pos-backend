import express from 'express';
import authentMiddleware from '../middleware/authentMiddleware';
import productCategoryCorntroller from '../../controllers/productCategoryController';
const router = express.Router();
const upload = require('../middleware/upload');
const authorize = require('../middleware/authorize');

router.get('/getAllCategories', productCategoryCorntroller.getAllCategories);
router.get('/getSingleCategory/:id', productCategoryCorntroller.getSingleCategory);
router.delete('/deleteCategory/:id', authentMiddleware, authorize(['moderator', 'admin']), productCategoryCorntroller.deleteCategory);
router.post('/addCategory', authentMiddleware, authorize(['moderator', 'admin']), upload.single('image'), productCategoryCorntroller.addCategory);
router.put('/updateCategory/:id', authentMiddleware, authorize(['moderator', 'admin']), upload.single('image'), productCategoryCorntroller.updateCategory);

module.exports = router;
