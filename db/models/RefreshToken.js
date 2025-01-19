const mongoose = require('mongoose');

const refreshTokenMaxAge = parseInt(process.env.JWT_REFRESH_TOKEN_MAX_AGE)*1000 || 86400000; // in milliseconds

const refreshTokenSchema = new mongoose.Schema(
    {
        userId: {
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
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + refreshTokenMaxAge),
            index: { expireAfterSeconds: 0 }, // TTL index
        },
    },
    { strict: 'throw' }
);

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
