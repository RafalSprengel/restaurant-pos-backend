const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');
const userController = require('../../controllers/staffController');
const router = express.Router();
const Staff = require('../../db/models/Staff');

router.all('/staff', authentMiddleware, authorize(['member', 'moderator', 'admin']), userController.staff);
router.get('/getStaff', authentMiddleware, authorize(['admin']), userController.getStaff);
router.get('/getStaffRoles', authentMiddleware, authorize(['admin']), userController.getStaffRoles);

module.exports = router;
