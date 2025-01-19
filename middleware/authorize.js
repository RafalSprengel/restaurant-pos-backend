const {Staff} = require('../db/models/Staff');
function authorize(roles = []) {
    return async function (req, res, next) {

        try {
            const staff = await Staff.findById(req.user._id);
            if (!staff || !roles.includes(staff.role)) {
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
