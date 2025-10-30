require('dotenv').config();
const logger = require('./utils/logger');
require('./db/mongoose.js');
const cors = require('cors');
const { port } = require('./config.js');
const express = require('express');
const passport = require('./config/passport');
const apiRoutes = require('./routes/v1/index.js');
const app = express();
const cookieParser = require('cookie-parser');
const visits = require('./middleware/visits');
let path = require('path');
const stripeController = require('./controllers/stripeController');

// All patch start from /api  e.g. wen use '/v1/auth/login' in real is '/api/v1/auth/login'
const originalConsoleError = console.error;
console.error = (...args) => {
    logger.error(args);
    originalConsoleError(...args);
};

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://localhost:3000', 
    'https://restaurant.rafalsprengel.com',
    'https://192.168.0.74:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(cookieParser());
app.use(visits);    // middleware to count visitors
app.post('/v1/stripe/webhook', express.raw({ type: 'application/json' }), stripeController.webhook); 
app.use(express.json());

app.use(passport.initialize());
app.get('/', (req, res) => {
    res.status(200).send('You’ve reached the Restaurant API');
});
app.use('/v1', apiRoutes);

app.use('/uploads', express.static('uploads'));

app.use((req, res) => {
    res.status(404).json({ error: 'Sorry, not valid API address.' });
});

app.listen(port, () => {
    console.log('Server is listening on port ' + port);
});
