const {Staff} = require('../db/models/Staff');
const mongoose = require('mongoose');


exports.staff = async (req, res) => {
    const staff = await Staff.findOne({ _id: req.staff._id });
    if (!staff) {
        return res.status(401).json({ error: 'Staff member not found' });
    }
    res.json({
        _id: req.staff.id,
        name: staff.name,
        surname: staff.surname,
        email: staff.email,
        role: staff.role,
    });
};

exports.getStaff = async (req, res) => {
    try {
        const users = await Staff.find().sort({ name: 1 });

        if (users) {
            return res.status(200).json(users);
        } else {
            return res.status(404).json({ error: 'Users not found' });
        }
    } catch (err) {
        console.error('ERROR fetching users: ', err);
        return res.status(500).json({ error: 'Error fetching users' });
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
