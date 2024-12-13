const User = require('../db/models/User');

/**
 * Fetch all users and sort them by name.
 */
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
