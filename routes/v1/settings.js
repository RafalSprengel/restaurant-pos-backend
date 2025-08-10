
const express = require('express');
const authentMiddleware = require('../../middleware/authentMiddleware');
const router = express.Router();
const settingsController = require('../../controllers/settingsController');
const authorize = require('../../middleware/authorize');

router.get('/', settingsController.getSettings); //zabezpieczyć scieżkę
router.put('/', settingsController.updateSettings); //zabezpieczyć scieżkę
// router.get('/smtp', settingsController.getSmtpSettings); //zabezpieczyć scieżkę
// router.post('/smtp', settingsController.createSmtpSettings); //zabezpieczyć scieżkę


module.exports = router;

