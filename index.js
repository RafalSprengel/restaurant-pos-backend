require('dotenv').config();
const { Customer } = require('./db/models/Customer');
const Order = require('./db/models/Order');
require('./db/mongoose.js');
const Product = require('./db/models/Product');
const { port } = require('./config.js');
const express = require('express');
const app = express();
const apiRouter = require('./routes/api');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
//app.use(express.json());

app.use(
    cors({
        origin: 'http://localhost:3000', // adres frontend
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true, // ciasteczka
    })
);

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    // console.log('wykonuje webhook ...');
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).end();
    }

    // console.log(`Receiver event.type: ${event.type}`);

    switch (event.type) {
        case 'payment_intent.succeeded':
            //   console.log('Payment was successful');
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;
            const order = await Order.findById(orderId);

            if (order) {
                order.status = 'completed';
                order.isPaid = true;
                order.paidAt = new Date();
                order.sessionId = paymentIntent.id;
                order.paymentIntent = paymentIntent.id;
                order.paymentFailureReason = '';
                await order.save();
            }
            break;

        case 'payment_intent.payment_failed':
            //   console.log('Payment failed or requires new payment method');
            const failedIntent = event.data.object;
            const failedOrderId = failedIntent.metadata.orderId;
            const failedOrder = await Order.findById(failedOrderId);
            if (failedOrder) {
                failedOrder.status = 'failed';
                failedOrder.isPaid = false;
                failedOrder.paymentFailureReason = failedIntent.last_payment_error ? failedIntent.last_payment_error.message : 'Unknown reason';
                await failedOrder.save();
            }
            break;

        case 'payment_intent.canceled':
            //    console.log('Payment canceled');
            const canceledIntent = event.data.object;
            const canceledOrderId = canceledIntent.metadata.orderId;
            const canceledOrder = await Order.findById(canceledOrderId);
            if (canceledOrder) {
                canceledOrder.isPaid = false;
                canceledOrder.paymentFailureReason = 'Canceled by customer';
                canceledOrder.status = 'canceled';
                await canceledOrder.save();
            }
            break;

        // Other events
        default:
            // console.log(`Unhandled event type ${event.type}`);
            break;
    }

    res.sendStatus(200);
});

app.use('/uploads', express.static('uploads'));
app.use('/api', apiRouter);
app.use(express.static('public'));

app.post('/create-checkout-session', express.json(), async (req, res) => {
    console.log('Wykonuje create-checkout-session');
    try {
        //Creating new customer to database
        let customer = null;
        const customerExists = await Customer.findOne({ email: req.body.customer.email });

        if (!customerExists) {
            console.log('Tworzę nowego customera');
            customer = new Customer({
                name: req.body.customer.name,
                surname: req.body.customer.surname,
                email: req.body.customer.email.toLowerCase(),
                isRegistered: false,
            });
            await customer.save();
        } else {
            //if email exists in database then update name and surname
            console.log('Zmieniam imię i nazwisko w bazie');
            customer = await Customer.findOneAndUpdate(
                { email: req.body.customer.email },
                { name: req.body.customer.name, surname: req.body.customer.surname }
            );
        }

        const productIds = req.body.items.map((item) => item.id);
        const products = await Product.find({ _id: { $in: productIds } }).populate('category'); //.select('price name');

        // Adding quantity to each product
        const productsWithQuantity = products.map((el) => {
            const item = req.body.items.find((item) => item.id === el._id.toString());
            const productObject = el.toObject();
            productObject.quantity = item ? item.quantity : 0; // set default quantity to 0 if item not found
            return productObject;
        });
        // Creating new order in database
        console.log('Customer to : ', customer);
        const order = new Order({
            customer: {
                customerNumber: customer.customerNumber,
                name: customer.name,
                surname: customer.surname,
                email: customer.email,
                isRegistered: customer.isRegistered,
                _id: customer._id,
            },
            products: productsWithQuantity.map((product) => ({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: product.quantity,
                totalPrice: product.price * product.quantity,
                ingridients: product.ingredients,
                isVegetarian: product.isVegetarian,
                isGlutenFree: product.isGlutenFree,
            })),
            totalPrice: productsWithQuantity.reduce((sum, product) => {
                return sum + product.price * product.quantity;
            }, 0),
            deliveryAddress: req.body?.deliveryAddress,
            orderType: req.body.orderType,
            orderTime: req.body?.orderTime,
            note: req.body?.note,
            status: 'new',
            isPaid: false,
        });

        await order.save();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'blik', 'p24'],
            line_items: productsWithQuantity.map((product) => ({
                price_data: {
                    currency: 'pln',
                    product_data: {
                        name: product.name,
                    },
                    unit_amount: Math.round(product.price * 100),
                },
                quantity: product.quantity,
            })),
            mode: 'payment',
            success_url: `${req.body.successUrl}?payment_intent={CHECKOUT_SESSION_ID}`,
            cancel_url: req.body.cancelUrl,
            metadata: {
                orderId: order._id.toString(),
            },
            customer_email: customer.email,
            payment_intent_data: {
                metadata: { orderId: order._id.toString() },
            },
        });

        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/session_status', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        res.send({
            status: session.status,
            payment_status: session.payment_status,
            customer_details: session.customer_details,
            order_id: session.metadata.orderId,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e.message });
    }
});

app.listen(port, () => {
    console.log('serwer słucha na porcie ' + port);
});
