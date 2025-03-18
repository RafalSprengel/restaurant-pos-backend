require('dotenv').config();
//console.log(process.env.GOOGLE_CLIENT_ID);
//console.log(process.env.GOOGLE_CLIENT_SECRET);
const logger = require('./utils/logger');
require('./db/mongoose.js');
const cors = require('cors');
const { port } = require('./config.js');
const express = require('express');
const passport = require('./config/passport');
const apiRoutes_v1 = require('./routes/v1/index.js');
const app = express();
const cookieParser = require('cookie-parser');
const visits = require('./middleware/visits');
const Visit = require('./db/models/Visit')


const originalConsoleError = console.error;
console.error = (...args) => { 
    logger.error(args); 
    originalConsoleError(...args); 
};

if (process.env.NODE_ENV === 'development') {
    app.use(
        cors({
            origin: 'http://localhost:3000', 
            methods: ['GET', 'POST', 'PUT', 'DELETE'], 
            allowedHeaders: ['Content-Type', 'Authorization'], 
            credentials: true, 
        })
    );
}

app.use(cookieParser());

app.use(visits);    // middleware to count visitors

app.use(express.json());

console.log('działa 3');
app.use(passport.initialize());
app.get('/', (req, res) => {
    res.status(200).send('Welcome to the Restaurant API');
});
app.use('/v1', apiRoutes_v1);

app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
    console.log('Server is listening on port ' + port);
});
