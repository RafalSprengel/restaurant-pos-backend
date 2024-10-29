const express = require('express');
const router = express.Router();
const MenuAction = require('../actions/menuActions');
const upload = require('../middleware/upload');
const authentMiddleware = require('../middleware/authentMiddleware');

router.post('/saveCategory', MenuAction.saveCategory);
router.delete('/deleteCategory/:id', MenuAction.deleteCategory);
router.get('/getAllCategories', MenuAction.getAllCategories);
router.post('/addCategory', upload.single('image'), MenuAction.addCategory);
router.post('/addProduct', MenuAction.addProduct);
router.delete('/deleteProduct/:id', MenuAction.deleteProduct);
router.delete('/deleteCustomer/:id', MenuAction.deleteCustomer);
router.delete('/deleteOrder/:id', MenuAction.deleteOrder);
router.get('/getProducts', MenuAction.getProducts);
router.get('/getCustomers', MenuAction.getCustomers);
router.put('/updateProduct/:id', MenuAction.updateProduct);
router.put('/updateCategory/:id', upload.single('image'), MenuAction.updateCategory);
router.get('/getSingleProduct/:id', MenuAction.getSingleProduct);
router.get('/getSingleCategory/:id', MenuAction.getSingleCategory);
router.get('/getOrders', MenuAction.getOrders);
router.get('/getOrders/:id', MenuAction.getOrders);

router.all('/user', authentMiddleware, (req, res) => {
    res.json(req.user);
});

router.all('*', (req, res) => {
    res.status(404).json({ error: 'not valid API address' });
});

module.exports = router;
