
const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const router = express.Router();
const statsController = require('../../controllers/statsController');
const authorize = require('../../middleware/authorize');

router.get('/', authentMiddleware,  authorize(['guest', 'member', 'moderator', 'admin']), statsController.getStats)

module.exports = router;