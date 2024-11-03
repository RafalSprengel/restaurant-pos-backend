const jwt = require('jsonwebtoken');

const UserInvalidToken = require('../db/models/UserInvalidToken');

const authentMiddleware = async (req, res, next) => {
    const accessToken = req.headers.authorization;
    if (!accessToken) {
        return res.status(401).json({ error: 'No accessToken found!' });
    }

    if (await UserInvalidToken.findOne({ token: accessToken })) {
        return res.status(401).json({ message: 'Access token invalid', code: 'AccessTokenInvalid' });
    }

    try {
        const decodedAccessToken = jwt.verify(accessToken, process.env.JWT_SECRET);
        req.accessToken = { value: accessToken, exp: decodedAccessToken.exp };
        req.user = { id: decodedAccessToken.userId };
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Access token expired', code: 'AccessTokenExpired' });
        } else if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Access token invalid', code: 'AccessTokenInvalid' });
        } else {
            return res.status(500).json({ message: err.message });
        }
    }
};

module.exports = authentMiddleware;
