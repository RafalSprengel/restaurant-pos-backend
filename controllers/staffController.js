const {Staff} = require('../db/models/Staff');
const mongoose = require('mongoose');


exports.session = async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    
    res.json({
        _id: req.user._id,
        name: req.user.name,
        surname:req.user.surname,
        email:req.user.email,
        role: req.user.role,
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
