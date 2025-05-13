const express = require('express');
const router = express.Router();
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');

router.get('/', authentMiddleware, authorize(['member', 'moderator', 'admin']), tableController.getTables);