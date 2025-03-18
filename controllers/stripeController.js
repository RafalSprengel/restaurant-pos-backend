const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {Customer }= require('../db/models/Customer');
const Product = require('../db/models/Product');
const Order = require('../db/models/Order');

exports.createCheckoutSession = async (req, res) => {
  
    try {

        const productIds = req.body.items.map((item) => item.id);
        const products = await Product.find({
            _id: { $in: productIds },
        }).populate('category');

        const productsWithQuantity = products.map((el) => {
            const item = req.body.items.find((item) => item.id === el._id.toString());
            const productObject = el.toObject();
            productObject.quantity = item ? item.quantity : 0; // Default quantity to 0 if item not found
            return productObject;
        });
        const order = new Order({
            isGuest: req.body.isGuest,
            customerId: req.body.isGuest ? null : req.body.customerId,
            purchaserDetails:{
                firstName: req.body.customer.name,
                surname: req.body.customer.surname,
                phone: req.body.customer.phone,
                email: req.body.customer.email
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
            customer_email: req.body.customer.email,
            payment_intent_data: {
                metadata: { orderId: order._id.toString() },
            },
        });

        res.json({ url: session.url });
    } catch (e) {
        console.error("Error occurred: ", e);
        res.status(500).json({ error: e.message }); 
    }
};

exports.getSessionStatus = async (req, res) => {
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
};

exports.webhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).end();
    }

    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
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
        }
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: 'Webhook processing failed' });
    }

    res.sendStatus(200);
};
