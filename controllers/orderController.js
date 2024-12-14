const { Order } = require('../db/models/Order');

/**
 * Fetch paginated orders with search and sorting.
 */
exports.getOrders = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const searchString = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'desc' ? 1 : -1;

    const search = searchString
        ? {
              $or: [
                  { 'customer.name': { $regex: searchString, $options: 'i' } },
                  { 'customer.surname': { $regex: searchString, $options: 'i' } },
                  { 'customer.email': { $regex: searchString, $options: 'i' } },
                  { 'product.name': { $regex: searchString, $options: 'i' } },
                  { orderType: { $regex: searchString, $options: 'i' } },
                  { orderNumber: { $regex: searchString, $options: 'i' } },
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
            .populate('customer', 'name surname');

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

/**
 * Fetch a single order by ID.
 */
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

/**
 * Delete an order by ID.
 */
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
