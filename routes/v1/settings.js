
const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const router = express.Router();
const settingsController = require('../../controllers/settingsController');
const authorize = require('../../middleware/authorize');

router.get('/',authentMiddleware, authorize(['guest', 'member', 'moderator', 'admin']), settingsController.getSettings); 
router.put('/', authentMiddleware, authorize(['moderator', 'admin']),settingsController.updateSettings);

module.exports = router;

