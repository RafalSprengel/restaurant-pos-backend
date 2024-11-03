const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const userSchema = new mongoose.Schema({
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
        sparse: true, // Pozwala na brak wartości, gdy użytkownik loguje się przez Google lub Facebooka
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
        enum: ['admin', 'moderator', 'member'],
        default: 'member',
    },
});

// Hashowanie hasła przed zapisem, tylko jeśli jest ustawione
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });

userSchema.plugin(timestamps);

const User = mongoose.model('User', userSchema);

module.exports = User;
