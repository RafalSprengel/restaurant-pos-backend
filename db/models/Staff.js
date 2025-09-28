const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const staffSchema = new mongoose.Schema({
    staffNumber: {
        type: Number,
        unique: true,
    },
    firstName: {
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
    role: {
        type: String,
        enum: [ 'guest', 'member', 'moderator', 'admin'],
        default: 'member',
    },
}, { strict: 'throw' });

staffSchema.plugin(timestamps);

staffSchema.plugin(AutoIncrement, { inc_field: 'staffNumber' }); //add autoincrement to mongoose

const Staff = mongoose.model('Staff', staffSchema);
module.exports = { Staff, staffSchema };
