const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const timestamps = require('mongoose-timestamp');

const customerSchema = new mongoose.Schema({
    customerNumber: {
        type: Number,
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    email: {
        type: String,
        required: true,
        unique: true, 
    },
    address: {
        city: {
            type: String,
            default: '',
        },
        street: {
            type: String,
            default: '',
        },
        houseNo: {
            type: String,
            default: '',
        },
        flatNo: {
            type: String,
            default: '',
        },
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId && !this.facebookId;
        },
    },
    googleId: {
        type: String
    },
    facebookId: {
        type: String
    },
}, { strict: 'throw' });

customerSchema.plugin(AutoIncrement, { inc_field: 'customerNumber' });

customerSchema.plugin(timestamps);

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;

