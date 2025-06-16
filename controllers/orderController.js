const Order = require('../db/models/Order');

exports.getCustomerOrders = async (req, res) => {

    const { user } = req;
    try {
        const orders = await Order.find({ customerId: user._id, isVisible: true });
        if (orders) {
            return res.status(200).json(orders);
        } else {
            return res.status(404).json({ error: 'Orders not found' });
        }
    } catch (e) {
        console.log('ERROR fetching orders: ', e);
        return res.status(500).json({ error: e.message });
    }
}

exports.updateCustomerOrder = async (req, res) => {
    const { id } = req.params;
    const { user } = req;
    console.log('user: ', user);
    console.log('id: ', id);
    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: id, customerId: user._id },
            { isVisible: false },
            { new: true }
        );
        if (updatedOrder) {
            return res.status(200).json({ message: 'Order deleted successfully' });
        } else {
            return res.status(404).json({ error: 'Order not found' });
        }
    }
    catch (err) {
        console.error('ERROR deleting order: ', err);
        return res.status(500).json({ error: 'Error deleting order' });
    }
}

exports.getOrders = async (req, res) => {
    console.log('wykonuje get orders')
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const searchString = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'desc' ? 1 : -1;

    const search = searchString
        ? {
            $or: [
                { 'purchaserDetails.firstName': { $regex: searchString, $options: 'i' } },
                { 'purchaserDetails.surname': { $regex: searchString, $options: 'i' } },
                { 'purchaserDetails.email': { $regex: searchString, $options: 'i' } },
                { 'products.name': { $regex: searchString, $options: 'i' } },
                { 'deliveryAddress.city': { $regex: searchString, $options: 'i' } },
                { orderType: { $regex: searchString, $options: 'i' } },
                ...(isNaN(parseInt(searchString)) ? [] : [{ orderNumber: { $eq: parseInt(searchString) } }]),
                { note: { $regex: searchString, $options: 'i' } },
                { status: { $regex: searchString, $options: 'i' } },
            ],
        }
        : {};


    try {
        const orders = await Order.find(search)
            .sort({ [sortBy]: sortOrder })
            .collation({ locale: 'en', strength: 2 })
            .skip(offset)
            .limit(limit)

        const totalOrders = await Order.countDocuments(search);

        if (orders) {
            return res.status(200).json({
                currentPage: page,
                totalPages: Math.ceil(totalOrders / limit),
                orders,
            });
        } else {
            return res.status(404).json({ error: 'Orders not found' });
        }
    } catch (e) {
        console.log('ERROR fetching orders: ', e);
        return res.status(500).json({ error: e.message });
    }
};

exports.getSingleOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findById(id).populate('customer', 'name surname');
        if (order) {
            return res.status(200).json(order);
        } else {
            return res.status(404).json({ error: 'Order not found' });
        }
    } catch (err) {
        console.error('ERROR fetching order: ', err);
        return res.status(500).json({ error: 'Error fetching order' });
    }
};

exports.deleteOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedOrder = await Order.findByIdAndDelete(id);
        if (deletedOrder) {
            return res.status(200).json({ message: 'Order deleted successfully' });
        } else {
            return res.status(404).json({ error: 'Order not found' });
        }
    } catch (err) {
        console.error('ERROR deleting order: ', err);
        return res.status(500).json({ error: 'Error deleting order' });
    }
};
