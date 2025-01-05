const mongoose = require('mongoose');
const { customerSchema } = require('./Customer');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const timestamps = require('mongoose-timestamp');

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    ingredients: [{ type: String }],
    isVegetarian: { type: Boolean, required: true },
    isGlutenFree: { type: Boolean, required: true },
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: Number,
        unique: true,
    },
    customer: customerSchema,
    products: [orderItemSchema],
    totalPrice: {
        type: Number,
        required: true,
    },
    deliveryAddress: {
        type: Object,
        required: false,
    },
    orderType: {
        type: String,
        enum: ['delivery', 'pickup', 'dine-in'],
        required: true,
    },
    orderTime: {
        type: String,
    },
    note: {
        type: String,
    },
    status: {
        type: String,
        enum: ['new', 'created', 'processing', 'failed', 'canceled', 'completed'],
        default: 'new',
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    sessionId: {
        type: String,
    },
    paymentIntent: {
        type: String,
    },
    paymentFailureReason: {
        type: String,
    },
});

orderSchema.plugin(timestamps); //add timestamps to mongoose

orderSchema.plugin(AutoIncrement, { inc_field: 'orderNumber' }); //add autoincrement to mongoose

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
