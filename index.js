require('dotenv').config();
const logger = require('./utils/logger');
require('./db/mongoose.js');
const { port } = require('./config.js');
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const apiRoutes = require('./routes/api');
const app = express();
const cookieParser = require('cookie-parser');

const originalConsoleError = console.error;
console.error = (...args) => { 
    logger.error(args); 
    originalConsoleError(...args); 
  };

app.use(cookieParser());

// Middleware to parse incoming JSON request bodies
app.use(express.json());

app.use(
    cors({
        origin: 'http://localhost:3000', // Allow requests from the frontend running on localhost:3000
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Supported HTTP methods
        allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
        credentials: true, // Enable sending cookies along with requests
    })
);

app.use(passport.initialize());

app.use('/api', apiRoutes);

app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
    console.log('Server is listening on port ' + port);
});
