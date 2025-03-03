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
    isGuest: {
        type: Boolean, 
        required: true,
    },
    customerId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: function () {
            return !this.isGuest;
        },
    },
    purchaserDetails: {
        firstName: { type: String, required: true },
        surname: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true },
    },
    products: [orderItemSchema],
    totalPrice: {
        type: Number,
        required: true,
    },
    deliveryAddress: {
        type: new mongoose.Schema({
            city: { type: String, required: function() { return this.orderType === 'delivery'; } },
            street: { type: String, required: function() { return this.orderType === 'delivery'; } },
            houseNo: { type: String, required: function() { return this.orderType === 'delivery'; } },
            flatNo: { type: String, default: '' },
            floor: { type: String, default: '' }
        }),
        required: function() {
            return this.orderType === 'delivery'; // całe pole deliveryAddress jest wymagane tylko wtedy, gdy orderType to "delivery"
        }
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
},{ strict: 'throw' });


orderSchema.plugin(timestamps); //add timestamps to mongoose

orderSchema.plugin(AutoIncrement, { inc_field: 'orderNumber' }); //add autoincrement to mongoose

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
