const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const RefreshToken = require('../db/models/RefreshToken');
const InvalidToken = require('../db/models/InvalidToken');
const {Customer} = require('../db/models/Customer');
const {Staff} = require('../db/models/Staff')

const generateToken = (user) => {
    const payload = {
        _id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_REFRESH, {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    });

    return { token, refreshToken }; 
};

// Sysytem customer registration function
exports.registerNewCustomer = async (req, res) =>  {
    const { name, surname, email, password } = req.body;
    if (!name || !surname || !email || !password) return res.status(422).json({ error: 'Missing required fields' });

    try {
        if (!process.env.JWT_SECRET || !process.env.JWT_TOKEN_EXPIRES_IN) return res.status(500).json({ error: 'Internal server error' });

        let customer = await Customer.findOne({ email });
        if (customer) return res.status(409).json({ error: 'Customer already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        customer = new Customer({
            name,
            surname,
            email,
            isRegistered: true,
            password: hashedPassword,
        });

        await customer.save();
        res.status(201).json({
            message: 'Customer registered, you can log in now using your credentials',
            customerId: customer._id,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error during registration' });
    }
}
;

exports.loginCustomer = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        let customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const { token, refreshToken } = generateToken(customer);

        await RefreshToken.findOneAndUpdate({ userId: customer._id }, { refreshToken }, { upsert: true });
        res.cookie('jwt', token, {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, // 1 godzina
            sameSite: 'Lax',
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            path: '/api/auth/refresh-token',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 * 24 * 15, // 15 dni
            sameSite: 'Lax',
        });

        res.status(200).json({
            _id: customer._id,
            name: customer.name,
            surname: customer.surname,
            email: customer.email,
            role: customer.role,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error during login' });
    }
};

// Sysytem user registration function
exports.registerNewStaffMember = async (req, res) => {
    const { name, surname, email, role, password } = req.body;
    if (!name || !surname || !email || !password) return res.status(422).json({ error: 'Missing required fields' });

    try {
        if (!process.env.JWT_SECRET || !process.env.JWT_TOKEN_EXPIRES_IN) return res.status(500).json({ error: 'Internal server error' });

        let staff = await Staff.findOne({ email });
        if (staff) return res.status(409).json({ error: 'Staff member already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        staff = new Staff({
            name,
            surname,
            email,
            role,
            password: hashedPassword,
        });

        await staff.save();
        res.status(201).json({
            message: 'Staff registered, you can log in now using your credentials',
            userId: staff._id,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error during registration' });
    }
};

// Local login function
exports.loginStaff = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(422).json({ error: 'Missing required fields' });

    try {
        const staff = await Staff.findOne({ email });
        if (!staff) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, staff.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const { token, refreshToken } = generateToken(staff);

        await RefreshToken.findOneAndUpdate({ userId: staff._id }, { refreshToken }, { upsert: true });

        res.cookie('jwt', token, {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, //1h
            sameSite: 'Lax',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            path: '/api/auth/refresh-token',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 * 24 * 15, //15days
            sameSite: 'Lax',
        });
        res.status(200).json({
            _id: staff._id,
            name: staff.name,
            surname: staff.surname,
            email: staff.email,
            role: staff.role,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error during login' });
    }
};

// Refresh token function
exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) return res.status(401).json({ error: 'Missing refresh token' });

        // Użycie modułu `jsonwebtoken` bez nadpisywania nazwy
        const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);

        if (!decodedRefreshToken) return res.status(401).json({ error: 'Invalid or expired refresh token' });

        const existingToken = await RefreshToken.findOne({
            refreshToken,
            userId: decodedRefreshToken.userId,
        });

        if (!existingToken) return res.status(401).json({ error: 'Invalid refresh token' });

        if (!process.env.JWT_SECRET_REFRESH || !process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) return res.status(500).json({ error: 'Internal server error' });

        const newAccessToken = jwt.sign({ userId: decodedRefreshToken.userId }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
        });

        const newRefreshToken = jwt.sign({ userId: decodedRefreshToken.userId }, process.env.JWT_SECRET_REFRESH, {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
        });

        await RefreshToken.findOneAndUpdate({ userId: decodedRefreshToken.userId }, { refreshToken: newRefreshToken }, { upsert: true, new: true });
        res.cookie('jwt', newAccessToken, {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, //1h
            sameSite: 'Lax',
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            path: '/api/auth/refresh-token',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 * 24 * 15, //15days
            sameSite: 'Lax',
        });
        res.status(200).json({ message: 'Jwt and refreshToken refreshed' });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Refresh token invalid or expired' });
        }

        return res.status(500).json({ message: error.message });
    }
};

// user Logout function
exports.logout = async (req, res) => {
    try {
        const currentToken = req.cookies.jwt;

        // Clear cookies
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            path: '/',
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            path: '/api/auth/refresh-token',
        });

        if (req.user && req.user._id && currentToken) {
            // Remove refresh tokens from valid tokens collection
            await RefreshToken.deleteMany({ userId: req.user._id });

            // Add both tokens to invalid tokens collection
            await InvalidToken.create({
                token: req.cookies.jwt,
                userId: req.user._id,
                expirationTime: req.accessToken.exp,
            });
    
        }

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Somethings went wrong during logging out:', error);
        res.status(500).json({ message: 'Logged out UNSUCCESSFULLY!' });
    }
};


// Google login configuration
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                user = new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                });
                await user.save();
            }
            done(null, user);
        }
    )
);

exports.googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email'],
});

exports.googleCallback = (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`/auth/success?token=${token}`);
};

// Facebook login configuration
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: '/auth/facebook/callback',
            profileFields: ['id', 'displayName', 'emails'],
        },
        async (accessToken, refreshToken, profile, done) => {
            let user = await User.findOne({ facebookId: profile.id });
            if (!user) {
                user = new User({
                    facebookId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                });
                await user.save();
            }
            done(null, user);
        }
    )
);

exports.facebookAuth = passport.authenticate('facebook', { scope: ['email'] });
exports.facebookCallback = (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`/auth/success?token=${token}`);
};
