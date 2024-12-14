import express from 'express';
import authentMiddleware from '../middleware/authentMiddleware';
import authorize from '../middleware/authorize';
const router = express.Router();
const User = require('../db/models/User');

router.all('/user', authentMiddleware, authorize(['member', 'moderator', 'admin']), async (req, res) => {
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }
    res.json({
        _id: req.user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
    });
});

router.get('/getUsers', authentMiddleware, authorize(['admin']), ApiController.getUsers);

module.exports = router;
