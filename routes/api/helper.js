import express from 'express';
import authentMiddleware from '../../middleware/authentMiddleware';
import authorize from '../../middleware/authorize';
import helperController from '../../controllers/helperController';

const router = express.Router();

router.get('/getRoles', authentMiddleware, authorize(['admin']), helperController.getRoles);

router.all('*', (req, res) => {
    res.status(404).json({ error: 'Not a valid API address' });
});

module.exports = router;
