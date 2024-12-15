const express = require('express');
const authRoutes = require('./auth');
const orderRoutes = require('./orders');
const productRoutes = require('./products');
const customerRoutes = require('./customers');
const productCategoryRoutes = require('./productCategories');
const stripeRoutes = require('./stripe');
const userRoutes = require('./users');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/productCategories', productCategoryRoutes);
router.use('/products', productRoutes);
router.use('/stripe', stripeRoutes);
router.use('/users', userRoutes);

router.all('*', (req, res) => {
    res.status(404).json({ error: 'Not a valid API address' });
});

module.exports = router;
