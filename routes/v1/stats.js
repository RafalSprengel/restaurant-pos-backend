
const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const router = express.Router();
const statsController = require('../../controllers/statsController');
const authorize = require('../../middleware/authorize');

router.get('/', authentMiddleware, authorize(['admin']), statsController.getStats)

module.exports = router;