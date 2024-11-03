const User = require('../db/models/User');

function authorize(roles = []) {
    return async function (req, res, next) {
        const user = await User.findById(req.user.id);
        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        next();
    };
}

module.exports = authorize;
