const mongoose = require('mongoose');

const UserInvalidTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    expirationTime: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model('UserInvalidToken', UserInvalidTokenSchema);
