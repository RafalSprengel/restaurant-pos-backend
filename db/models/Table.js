const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: { type: Number, required: true, unique: true },
    capacity: { type: Number, required: true }, // Pojemność stolika (4, 8, 12)
    location: { type: String, required: true }, // Lokalizacja stolika, np. "Salon", "Taras"
});

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;