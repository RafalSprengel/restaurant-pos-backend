const mongoose = require('mongoose');

const invalidTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    createdAt: { 
        type: Date,
        default: Date.now,
        expires: 604800 // 7 dni w sekundach (7 * 24 * 60 * 60)
    }
});

const InvalidToken = mongoose.model('InvalidToken', invalidTokenSchema);

module.exports = InvalidToken;
