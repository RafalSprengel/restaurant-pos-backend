const express = require('express');
const router = express.Router();
const tableController =require('../../controllers/tableController')
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');

//router.get('/reservations',authentMiddleware, authorize(['member', 'moderator', 'admin']), tableController.getAllReservatons)
router.get('/reservations', tableController.getReservations)  // temporary

//router.get('/reservations/:id', authentMiddleware, authorize(['member', 'moderator', 'admin']), tableController.getSingleReservaton)
router.get('/reservations/:id', tableController.getReservationById)

//router.delete('/reservations/:id', authentMiddleware, authorize(['admin']), tableController.deleteSingleReservaton)
router.delete('/reservations/:id', tableController.deleteReservatonById)

router.post('/reservations', tableController.addReservation)
router.get('/availability', tableController.getAvailability);
router.get('/type-of-tables', tableController.getTypeOfTables); 
router.post('/', tableController.addTable)



module.exports = router