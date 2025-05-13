const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: { type: Number, required: true, unique: true },
    capacity: { type: Number, required: true },
    location: { type: String, required: true }, 
});

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;