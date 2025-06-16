const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/orders', require('./orders'));
router.use('/product-categories', require('./productCategories'));
router.use('/products', require('./products'));
router.use('/stripe', require('./stripe'));
router.use('/customers', require('./customers'));
router.use('/staff', require('./staff'));
router.use('/stats', require('./stats'));
router.use('/tables', require('./tables'))
router.use('/messages', require('./message'))
module.exports = router;
