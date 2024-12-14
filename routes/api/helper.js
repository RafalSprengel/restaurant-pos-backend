import express from 'express';
import User from '../../db/models/User';
import authentMiddleware from '../../middleware/authentMiddleware';
import authorize from '../../middleware/authorize';

const router = express.Router();

router.get('/getRoles', authentMiddleware, authorize(['admin']), async (req, res) => {
    try {
        const roles = User.schema.path('role').enumValues;

        roles.sort((a, b) => {
            if (a.toLowerCase().startsWith('member')) return -1;
            if (b.toLowerCase().startsWith('member')) return 1;
            return b.toLowerCase().localeCompare(a.toLowerCase());
        });

        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving roles' });
    }
});

router.all('*', (req, res) => {
    res.status(404).json({ error: 'Not a valid API address' });
});

module.exports = router;
