const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  date: { type: String, unique: true }, // YYYY-MM-DD
  visitors: { type: Number, default: 0 }
});

module.exports = mongoose.model('Visit', VisitSchema);
