const User = require('../db/models/User');

/**
 * Fetch all users and sort them by name.
 */
exports.user = async (req, res) => {
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }
    res.json({
        _id: req.user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
    });
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ name: 1 });

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
