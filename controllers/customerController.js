const { Customer } = require('../db/models/Customer');
const { Order } = require('../db/models/Order');

/**
 * Fetch all customers with their number of orders.
 */
exports.customers = async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const customer = await Customer.findOne({ _id: req.user._id });
    if (!customer) {
        return res.status(401).json({ error: 'Customer not found' });
    }
    res.json({
        _id: req.user.id,
        name: customer.name,
        surname: customer.surname,
        email: customer.email,
        role: customer.role,
    });
};

exports.getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ customerNumber: 1 });

        if (customers.length > 0) {
            const customersWithOrders = await Promise.all(
                customers.map(async (customer) => {
                    const amountOfOrders = await Order.countDocuments({
                        'customer._id': customer._id,
                    });
                    return {
                        ...customer.toObject(),
                        amountOfOrders,
                    };
                })
            );

            return res.status(200).json(customersWithOrders);
        } else {
            return res.status(404).json({ error: 'Customers not found' });
        }
    } catch (err) {
        console.error('ERROR fetching customers: ', err);
        return res.status(500).json({ error: 'Error fetching customers' });
    }
};

/**
 * Delete a customer by ID.
 */
exports.deleteCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCustomer = await Customer.findByIdAndDelete(id);
        if (deletedCustomer) {
            return res.status(200).json({ message: 'Customer deleted successfully' });
        } else {
            return res.status(404).json({ error: 'Customer not found' });
        }
    } catch (err) {
        console.error('ERROR deleting customer: ', err);
        return res.status(500).json({ error: 'Error deleting customer' });
    }
};
