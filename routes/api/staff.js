const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');
const staffController = require('../../controllers/staffController');
const router = express.Router();

router.get('/session', authentMiddleware, authorize(['member', 'moderator', 'admin']), staffController.session);
router.get('/getStaff', authentMiddleware, authorize(['admin']), staffController.getStaff);
router.get('/getStaffRoles', authentMiddleware, authorize(['admin']), staffController.getStaffRoles);

module.exports = router;
