const Customer = require('../db/models/Customer');
const Order = require('../db/models/Order');
const bcrypt = require('bcryptjs');

//==========  Customer panel  ======

exports.getCustomerDetailsAsCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).select('-password -__v');
        if (customer) {
            return res.status(200).json(customer);
        } else {
            return res.status(404).json({ error: 'Customer not found' });
        }
    }
    catch (err) {
        console.error('ERROR fetching customer: ', err);
        return res.status(500).json({ error: 'Error fetching customer' });
    }
};

exports.updateCustomerAsCustomer = async (req, res) => {
    const { firstName, surname, email, phone, password, address } = req.body;
    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(req.user._id, {
            $set: {
                firstName, surname, email, phone, password, address
            },
        }, { new: true });
        if (updatedCustomer) {
            return res.status(200).json({ message: 'Customer updated successfully' });
        } else {
            return res.status(404).json({ error: 'Customer not found' });
        }
    }
    catch (err) {
        console.error('ERROR updating customer: ', err);
        return res.status(500).json({ error: 'Error updating customer' });
    }
};

exports.updatePasswordAsCustomer = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Old and new passwords are required' });
    }
    try {
        const customer = await Customer.findById(req.user._id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        const isMatch = await bcrypt.compare(oldPassword, customer.password);
        if (!isMatch) return res.status(400).json({ error: 'Old password is incorrect' });

        const isSameAsOld = await bcrypt.compare(newPassword, customer.password);
        if (isSameAsOld) return res.status(409).json({ error: 'New password must be different from old password' });


        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        customer.password = hashedNewPassword;
        await customer.save();
        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('ERROR updating password: ', err);
        return res.status(500).json({ error: 'Error updating password' });
    }
};

exports.deleteUserAccountAsUser = async (req, res) => {
    const { user } = req;
    if (!user || !user._id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const deletedCustomer = await Customer.findOneAndDelete({ _id: user._id });
        if (!deletedCustomer) {
            return res.status(404).json({ message: 'user not found' });
        }
        return res.status(204).send();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'User not deleted, error: ' + err.message });
    }
};

//=========  Admin panel  =========

exports.getCustomersAsAdmin = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const searchString = req.query.search || '';
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    const search = searchString ? {
        $or: [
            { firstName: { $regex: searchString, $options: 'i' } },
            { surname: { $regex: searchString, $options: 'i' } },
            { email: { $regex: searchString, $options: 'i' } },
            ...(isNaN(parseInt(searchString)) ? [] : [{ customerNumber: { $eq: parseInt(searchString) } }])
        ]
    } : {};

    try {
        const filters = { ...search };

        const customers = await Customer.find(filters)
            .sort({ [sortBy]: sortOrder })
            .skip(offset)
            .limit(limit);

        const totalCustomers = await Customer.countDocuments(filters);

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

        return res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalCustomers / limit),
            customers: customersWithOrders,
        });
    } catch (err) {
        console.error('ERROR fetching customers: ', err);
        return res.status(500).json({ error: 'Error fetching customers' });
    }
};

exports.getSingleCustomerAsAdmin = async (req, res) => {
    try {
        const product = await Customer.findById(req.params.id).select('-password -__v');
        if (product) {
            return res.status(200).json(product);
        } else {
            return res.status(404).json({ error: 'Customer not found' });
        }
    } catch (err) {
        console.error('ERROR fetching customer: ', err);
        return res.status(500).json({ error: 'Error fetching customer' });
    }
};

exports.updateCustomerAsAdmin = async (req, res) => {
    const { id } = req.params;
    const { firstName, surname, email, phone, address } = req.body;

    try {
        const updatedCustomer = await Customer.findByIdAndUpdate(id,
            {
                $set: {
                    firstName, surname, email, phone, address
                },
            },
            { new: true }
        )
        if (updatedCustomer) return res.status(200).json(({ message: 'Customer updated successfully' }))
        else return res.status(404).json('Customer with this id not found')
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ error: 'Error, customer NOT updated, details: ' + e.message })
    }
}

exports.deleteCustomerAsAdmin = async (req, res) => {
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
