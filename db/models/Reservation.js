const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    tableNumber: { type: Number, require: true },
    reservedDate: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
    },
    customerName: { type: String, required: true },
}, { strict: 'throw' });

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
