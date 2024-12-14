import express from 'express';
import authentMiddleware from '../middleware/authentMiddleware';
import authorize from '../middleware/authorize';
import userController from '../../controllers/userController';
const router = express.Router();
const User = require('../db/models/User');

router.all('/user', authentMiddleware, authorize(['member', 'moderator', 'admin']), userController.user);
router.get('/getUsers', authentMiddleware, authorize(['admin']), userController.getUsers);
router.get('/getRoles', authentMiddleware, authorize(['admin']), userController.getRoles);

module.exports = router;
