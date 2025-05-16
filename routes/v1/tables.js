const express = require('express');
const router = express.Router();
const tableController =require('../../controllers/tableController')

router.post('/reservation', tableController.addReservation)
router.get('/:id', tableController.findAvailableTables);
router.get('/', tableController.getTables); 
router.post('/', tableController.addTable)


module.exports = router