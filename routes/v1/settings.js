
const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const router = express.Router();
const settingsController = require('../../controllers/settingsController');
const authorize = require('../../middleware/authorize');

router.get('/', authentMiddleware, settingsController.getSettings);
router.put('/', authentMiddleware, settingsController.updateSettings);

module.exports = router;