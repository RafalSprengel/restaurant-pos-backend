require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.json())
app.use(express.static("public"))

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const storeItems = new Map([
    [1, { priceInCents: 10000, name: "Naucz się React już dziś!" }],
    [2, { priceInCents: 20000, name: "Ucz się z nami CSS!" }]
])

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


app.listen(3000, () => {
    console.log('Server is running on localhost:', 3000);
});