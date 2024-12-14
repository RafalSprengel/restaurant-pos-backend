import express from 'express';
import authentMiddleware from '../middleware/authentMiddleware';
const router = express.Router();
const upload = require('../middleware/upload');
const authorize = require('../middleware/authorize');

router.get('/getAllCategories', ApiController.getAllCategories);
router.get('/getSingleCategory/:id', ApiController.getSingleCategory);
router.delete('/deleteCategory/:id', authentMiddleware, authorize(['moderator', 'admin']), ApiController.deleteCategory);
router.post('/addCategory', authentMiddleware, authorize(['moderator', 'admin']), upload.single('image'), ApiController.addCategory);
router.put('/updateCategory/:id', authentMiddleware, authorize(['moderator', 'admin']), upload.single('image'), ApiController.updateCategory);

module.exports = router;
