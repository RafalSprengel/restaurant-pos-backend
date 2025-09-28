const {Staff} = require('../db/models/Staff');



exports.getStaff = async (req, res) => { 
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const searchString = req.query.search || '';
        const sortBy = req.query.sortBy || 'name';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

        const search = searchString ? { 
            $or: [
                { name: { $regex: searchString, $options: 'i' } },
                { surname: { $regex: searchString, $options: 'i' } },
                { email: { $regex: searchString, $options: 'i' } }
            ]
        } : {};

        const staff = await Staff.find(search)
            .sort({ [sortBy]: sortOrder })
            .skip(offset)
            .limit(limit);

        const totalStaff = await Staff.countDocuments(search);

        return res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalStaff / limit),
            staff: staff
        });

    } catch (err) {
        console.error('ERROR fetching staff: ', err);
        return res.status(500).json({ error: 'Error fetching staff' });
    }
};

exports.getStaffRoles = async (req, res) => {
    try {
        const roles = await Staff.schema.path('role').enumValues;

        roles.sort((a, b) => {
            if (a.toLowerCase().startsWith('member')) return -1;
            if (b.toLowerCase().startsWith('member')) return 1;
            return b.toLowerCase().localeCompare(a.toLowerCase());
        });

        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving roles' });
    }
};

exports.getSingleStaff = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id).select('name firstName surname email role');
        if (staff) {
            return res.status(200).json(staff);
        } else {
            return res.status(404).json({ error: 'Staff not found' });
        }
    } catch (err) {
        console.error('ERROR fetching staff: ', err);
        return res.status(500).json({ error: 'Error fetching staff' });
    }
};

exports.updateStaff = async (req, res) => {
    const { id } = req.params;
    const { name, surname, email, password, role } = req.body;

    if (!id) return res.status(400).json({ error: 'Missing staff ID in request params' });
    if (!name && !surname && !email && !password && !role) {
        return res.status(422).json({ error: 'No fields provided for update' });
    }

    try {

        if (role && !Staff.schema.path('role').enumValues.includes(role)) {
            return res.status(400).json({
                error: 'Invalid role value. Allowed values are: ' + Staff.schema.path('role').enumValues.join(', '),
            });
        }

        if (email) {
            const existingStaff = await Staff.findOne({ email, _id: { $ne: id } });
            if (existingStaff) {
                return res.status(409).json({ error: 'Email is already in use by another staff member' });
            }
        }

        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const updateFields = {};
        if (name) updateFields.name = name;
        if (surname) updateFields.surname = surname;
        if (email) updateFields.email = email;
        if (role) updateFields.role = role;
        if (hashedPassword) updateFields.password = hashedPassword;

        const updatedStaff = await Staff.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true } 
        );

        if (updatedStaff) {
            return res.status(200).json({ message: 'Staff member updated successfully', updatedStaff });
        } else {
            return res.status(404).json({ error: 'Staff member with this ID not found' });
        }
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ error: 'Error, staff member NOT updated. Details: ' + e.message });
    }
};

exports.deleteStaff = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedStaff = await Staff.findByIdAndDelete(id);
        if (deletedStaff) {
            return res.status(200).json({ message: 'Staff member deleted successfully' });
        } else {
            return res.status(404).json({ error: 'Staff member  not found' });
        }
    } catch (err) {
        console.error('ERROR deleting product: ', err);
        return res.status(500).json({ error: 'Error deleting Staff member ' });
    }

};