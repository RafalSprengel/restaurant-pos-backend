const { database_url } = require('../config.js');

const mongoose = require('mongoose');

mongoose
    .connect(database_url)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });
