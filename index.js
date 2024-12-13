// Load environment variables
require('dotenv').config();

// Import models and database connection
const { Customer } = require('./db/models/Customer');
const Order = require('./db/models/Order');
require('./db/mongoose.js');
const Product = require('./db/models/Product');
const { port } = require('./config.js');

// Import necessary libraries
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const apiRouter = require('./routes/api');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Express app
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.json()); // Parse JSON request bodies

// CORS configuration
app.use(
    cors({
        origin: 'http://localhost:3000', // Frontend address
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true, // Enable cookies
    })
);

// Initialize Passport
app.use(passport.initialize());

// Webhook endpoint for Stripe
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Verify the webhook signature
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).end(); // Return error if verification fails
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            // Handle successful payment
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;
            const order = await Order.findById(orderId);

            if (order) {
                // Update order status
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
            // Handle failed payment
            const failedIntent = event.data.object;
            const failedOrderId = failedIntent.metadata.orderId;
            const failedOrder = await Order.findById(failedOrderId);
            if (failedOrder) {
                failedOrder.status = 'failed';
                failedOrder.isPaid = false;
                failedOrder.paymentFailureReason = failedIntent.last_payment_error
                    ? failedIntent.last_payment_error.message
                    : 'Unknown reason';
                await failedOrder.save();
            }
            break;

        case 'payment_intent.canceled':
            // Handle canceled payment
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

        default:
            // Handle unhandled event types
            break;
    }

    res.sendStatus(200); // Acknowledge receipt of the event
});

app.use('/api', apiRouter);
// Serve static files
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Create checkout session for Stripe
app.post('/create-checkout-session', express.json(), async (req, res) => {
    console.log('Creating checkout session');
    try {
        // Check if customer exists in database
        let customer = null;
        const customerExists = await Customer.findOne({
            email: req.body.customer.email,
        });

        if (!customerExists) {
            console.log('Creating new customer');
            customer = new Customer({
                name: req.body.customer.name,
                surname: req.body.customer.surname,
                email: req.body.customer.email.toLowerCase(),
                isRegistered: false,
            });
            await customer.save();
        } else {
            // Update customer's name and surname if email exists
            console.log('Updating customer name and surname in the database');
            customer = await Customer.findOneAndUpdate(
                { email: req.body.customer.email },
                {
                    name: req.body.customer.name,
                    surname: req.body.customer.surname,
                }
            );
        }

        const productIds = req.body.items.map((item) => item.id);
        const products = await Product.find({
            _id: { $in: productIds },
        }).populate('category');

        // Add quantity to each product
        const productsWithQuantity = products.map((el) => {
            const item = req.body.items.find((item) => item.id === el._id.toString());
            const productObject = el.toObject();
            productObject.quantity = item ? item.quantity : 0; // Default quantity to 0 if item not found
            return productObject;
        });

        // Create new order in the database
        console.log('Customer data: ', customer);
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
                ingredients: product.ingredients,
                isVegetarian: product.isVegetarian,
                isGlutenFree: product.isGlutenFree,
            })),
            totalPrice: productsWithQuantity.reduce((sum, product) => sum + product.price * product.quantity, 0),
            deliveryAddress: req.body?.deliveryAddress,
            orderType: req.body.orderType,
            orderTime: req.body?.orderTime,
            note: req.body?.note,
            status: 'new',
            isPaid: false,
        });

        await order.save();

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'blik', 'p24'],
            line_items: productsWithQuantity.map((product) => ({
                price_data: {
                    currency: 'pln',
                    product_data: {
                        name: product.name,
                    },
                    unit_amount: Math.round(product.price * 100), // Convert price to cents
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

        res.json({ url: session.url }); // Return the session URL
    } catch (e) {
        res.status(500).json({ error: e.message }); // Handle errors
    }
});

// Get session status for Stripe
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

// Start server
app.listen(port, () => {
    console.log('Server is listening on port ' + port);
});
