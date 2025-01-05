const jwt = require('jsonwebtoken');
const InvalidRefreshToken = require('../db/models/InvalidToken');

const authentMiddleware = async (req, res, next) => {
    const accessToken = req.cookies.jwt;

    if (!accessToken) {
        return res.status(401).json({ error: 'No accessToken found!' });
    }

    try {
        const decodedAccessToken = jwt.verify(accessToken, process.env.JWT_SECRET);

        if (
            await InvalidRefreshToken.findOne({
                token: accessToken,
                userId: decodedAccessToken.userId,
            })
        ) {
            return res.status(401).json({
                message: 'Access token invalid',
                code: 'AccessTokenInvalid',
            });
        }

        req.accessToken = { value: accessToken, exp: decodedAccessToken.exp };
        // req.user = {
        //     _id: decodedAccessToken._id,
        //     name: decodedAccessToken.name,
        //     role: decodedAccessToken.role,
        // };
        req.user = decodedAccessToken;
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: 'Access token expired',
                code: 'AccessTokenExpired',
            });
        } else if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message: 'Access token invalid',
                code: 'AccessTokenInvalid',
            });
        } else {
            return res.status(500).json({ message: err.message });
        }
    }
};

module.exports = authentMiddleware;
