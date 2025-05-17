const express = require('express');
const router = express.Router();
const tableController =require('../../controllers/tableController')

router.post('/reservation', tableController.addReservation)
router.get('/availability', tableController.getAvailability);
router.get('/', tableController.getTables); 
router.post('/', tableController.addTable)
router.get('/:id', tableController.findAvailableTables);



module.exports = router