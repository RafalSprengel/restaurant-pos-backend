require('dotenv').config();
require('./db/mongoose.js')

const { port } = require('./config.js')
const express = require('express');
const app = express();
const apiRouter = require('./routes/api');
const cors = require('cors');
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // frontend address
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // cookies
}));

app.use('/api', apiRouter)
//app.use(express.static("public"))

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const storeItems = new Map([
    [1, { priceInCents: 10000, name: "Naucz się React już dziś!" }],
    [2, { priceInCents: 20000, name: "Ucz się z nami CSS!" }]
])
//app.use('/api', apiRouter)
app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'blik', 'p24'],
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id)
                return {
                    price_data: {
                        currency: "pln",
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.priceInCents
                    },
                    quantity: item.quantity
                }
            }),
            mode: 'payment',
            success_url: `${process.env.SERVER_URL}/success.html`,
            cancel_url: `${process.env.SERVER_URL}/cancel.html`
        });
        res.json({ url: session.url });  // Send the session ID as a response
    }
    catch (e) {
        res.status(500).json({ error: e.message })
    }
})

app.listen(port, () => {
    console.log('serwer słucha na porcie ' + port)
});