const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;