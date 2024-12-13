const { Customer } = require('../db/models/Customer');
const { Order } = require('../db/models/Order');

/**
 * Fetch all customers with their number of orders.
 */
exports.getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ customerNumber: 1 });

        if (customers) {
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
exportr.deleteCustomer = async (req, res) => {
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
