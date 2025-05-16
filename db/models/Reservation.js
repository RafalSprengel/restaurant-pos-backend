const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    reservedDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    customerName: { type: String, required: true },
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
