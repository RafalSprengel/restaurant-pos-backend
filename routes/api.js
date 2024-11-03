const express = require('express');
const router = express.Router();
const MenuAction = require('../actions/menuActions');
const upload = require('../middleware/upload');
const authentMiddleware = require('../middleware/authentMiddleware');
const authorize = require('../middleware/authorize');
const User = require('../db/models/User');
const authRoutes = require('../routes/authRoutes');

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
router.use('/auth', authRoutes); // Authentication routes

router.all('/user', authentMiddleware, async (req, res) => {
    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }
    res.json({
        user_id: req.user.id,
        Message: 'Access granted for members, moderatord and admins only',
        user_email: user.email,
        role: user.role,
    });
});

router.all('/moderator', authentMiddleware, authorize(['admin', 'moderator']), async (req, res) => {
    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }
    res.json({
        user_id: req.user.id,
        Message: 'Access granted for admin and moderators only',
        user_email: user.email,
        role: user.role,
    });
});

router.all('/admin', authentMiddleware, authorize(['admin']), async (req, res) => {
    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }
    res.json({
        user_id: req.user.id,
        Message: 'Access granted for admin only',
        user_email: user.email,
        role: user.role,
    });
});

router.all('*', (req, res) => {
    res.status(404).json({ error: 'not valid API address' });
});

module.exports = router;
