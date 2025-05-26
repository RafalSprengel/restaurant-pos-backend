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
    customerDetails: {
        name: {
            type: String,
            require: true
        },
        email: {
            type: String,
            require: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
        },
        phone: {
            type: Number
        },
    },
    message: {
        type: String
    }
}, { strict: 'throw' });

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
