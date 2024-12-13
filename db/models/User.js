const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
    userNumber: {
        type: Number,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
    },
    password: {
        type: String,
        required: false,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    facebookId: {
        type: String,
        unique: true,
        sparse: true,
    },

    role: {
        type: String,
        enum: ['member', 'moderator', 'admin'],
        default: 'member',
    },
});

userSchema.plugin(timestamps);

userSchema.plugin(AutoIncrement, { inc_field: 'userNumber' }); //add autoincrement to mongoose

const User = mongoose.model('User', userSchema);

module.exports = User;
