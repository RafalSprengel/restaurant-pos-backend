const express = require('express');
const router = express.Router();
const tableController = require('../../controllers/tableController')
const authentMiddleware = require('../../middleware/authentMiddleware');
const authorize = require('../../middleware/authorize');

// ============= public routes ========================
router.post('/reservations', tableController.addReservation)
router.get('/availability', tableController.getAvailability);
router.get('/type-of-tables', tableController.getTypeOfTables);

// ================= private routes ===================

//router.get('/reservations',authentMiddleware, authorize(['member', 'moderator', 'admin']), tableController.getAllReservatons)
router.get('/reservations', authentMiddleware, authorize(['guest', 'member', 'moderator', 'admin']), tableController.getReservations)  // temporary

//router.get('/reservations/:id', authentMiddleware, authorize(['member', 'moderator', 'admin']), tableController.getSingleReservaton)
router.get('/reservations/:id', authentMiddleware, authorize(['guest', 'member', 'moderator', 'admin']), tableController.getReservationById)

//router.delete('/reservations/:id', authentMiddleware, authorize(['admin']), tableController.deleteSingleReservaton)
router.delete('/reservations/:id', authentMiddleware, authorize(['guest', 'member', 'moderator', 'admin']), tableController.deleteReservatonById)


router.post('/', authentMiddleware, authorize(['moderator', 'admin']), tableController.addTable)



module.exports = router