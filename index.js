require('dotenv').config({ path: '/var/www/api.justcode.uk/.env' });
//console.log(process.env.GOOGLE_CLIENT_ID);
//console.log(process.env.GOOGLE_CLIENT_SECRET);
const logger = require('./utils/logger');
require('./db/mongoose.js');
const { port } = require('./config.js');
const express = require('express');
const passport = require('./config/passport');
const apiRoutes_v1 = require('./routes/v1/index.js');
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

console.log('działa 3');
app.use(passport.initialize());

app.use('/v1', apiRoutes_v1);

app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
    console.log('Server is listening on port ' + port);
});
