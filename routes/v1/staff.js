const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');
const staffController = require('../../controllers/staffController');
const router = express.Router();

router.get('/', authentMiddleware,  authorize(['guest', 'member', 'moderator', 'admin']), staffController.getStaff);
router.get('/roles', authentMiddleware, authorize(['guest', 'member', 'moderator', 'admin']), staffController.getStaffRoles);
router.get('/:id', authentMiddleware,  authorize(['guest', 'member', 'moderator', 'admin']), staffController.getSingleStaff);
router.put('/:id', authentMiddleware, authorize(['admin']), staffController.updateStaff);
router.delete('/:id', authentMiddleware, authorize(['admin']), staffController.deleteStaff);


module.exports = router;
