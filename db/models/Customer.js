const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const timestamps = require('mongoose-timestamp');

const customerSchema = new mongoose.Schema({
    customerNumber: {
        type: Number,
    },
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    isRegistered: {
        type: Boolean,
        default: false,
    },
});

customerSchema.plugin(timestamps); //add timestamps to mongoose

customerSchema.plugin(AutoIncrement, { inc_field: 'customerNumber' }); //add autoincrement to mongoose

const Customer = mongoose.model('Customer', customerSchema);

module.exports = { Customer, customerSchema };
