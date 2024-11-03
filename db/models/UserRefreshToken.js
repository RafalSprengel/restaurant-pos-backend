const mongoose = require('mongoose');

const userTokenSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
            required: true,
        },
    },
    { strict: 'throw' }
);

module.exports = mongoose.model('UserRefreshToken', userTokenSchema);
