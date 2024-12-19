const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const customerInvalidTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    expirationTime: {
        type: Date,
        required: true,
    },
    invalidatedAt: {
        type: Date,
        default: Date.now,
    },
});

customerInvalidTokenSchema.plugin(timestamps);

customerInvalidTokenSchema.index({ token: 1 });
customerInvalidTokenSchema.index({ customerId: 1 });
customerInvalidTokenSchema.index({ expirationTime: 1 });

const CustomerInvalidToken = mongoose.model('CustomerInvalidToken', customerInvalidTokenSchema);

module.exports = CustomerInvalidToken;
