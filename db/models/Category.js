const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    index: {
        type: Number,
        required: false
    },
    image: {
        type: String,
        required: false
    }
}, { strict: 'throw' });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;