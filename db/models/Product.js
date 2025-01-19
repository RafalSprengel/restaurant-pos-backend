const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const timestamps = require('mongoose-timestamp');

const productSchema = new mongoose.Schema(
    {
        productNumber: {
            type: Number,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
        },
        image: {
            type: String,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        ingredients: [{ type: String }],
        isVegetarian: {
            type: Boolean,
            default: false,
        },
        isGlutenFree: {
            type: Boolean,
            default: false,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    { strict: 'throw' }
);

productSchema.plugin(timestamps); //add timestamps to mongoose

productSchema.plugin(AutoIncrement, { inc_field: 'productNumber' }); //add autoincrement to mongoose

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
