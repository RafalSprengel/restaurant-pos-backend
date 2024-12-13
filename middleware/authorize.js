const User = require('../db/models/User');

function authorize(roles = []) {
    return async function (req, res, next) {
        console.log('req.user._id: ', req.user._id);
        try {
            console.log('req.user._id: ', req.user._id);

            // Upewnij się, że odwołujesz się do `req.user._id`
            const user = await User.findById(req.user._id);

            if (!user || !roles.includes(user.role)) {
                return res.status(403).json({ error: 'Access denied' });
            }

            next();
        } catch (err) {
            console.error('Error during authorization:', err);
            return res.status(500).json({ error: 'Server error during authorization' });
        }
    };
}

module.exports = authorize;
