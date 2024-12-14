const { database_url } = require('../config.js');

const mongoose = require('mongoose');

mongoose
    .connect(database_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });
