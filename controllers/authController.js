const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../db/models/User');
const UserRefreshToken = require('../db/models/UserRefreshToken');
const UserInvalidToken = require('../db/models/UserInvalidToken');

const generateToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRES_IN });
};

// Registration function
exports.register = async (req, res) => {
    const { name, surname, email, role, password } = req.body;
    if (!name || !surname || !email || !password) return res.status(422).json({ error: 'Missing required fields' });

    try {
        if (!process.env.JWT_SECRET || !process.env.JWT_TOKEN_EXPIRES_IN) return res.status(500).json({ error: 'Internal server error' });

        let user = await User.findOne({ email });
        if (user) return res.status(409).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, surname, email, role, password: hashedPassword });

        await user.save();
        res.status(201).json({ message: 'User registered, you can log in now using your credentials', userId: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error during registration' });
    }
};

// Local login function
exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(422).json({ error: 'Missing required fields' });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

        const token = generateToken(user);

        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_REFRESH, {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
        });

        await UserRefreshToken.findOneAndUpdate({ user: user._id }, { token, refreshToken }, { upsert: true });

        res.status(200).json({
            message: 'Logged in successfully',
            user_name: user.name,
            user_surname: user.surname,
            token,
            refreshToken,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error during login' });
    }
};

// Refresh token function
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) return res.status(401).json({ error: 'Missing refresh token' });

        const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);

        if (!decodedRefreshToken) return res.status(401).json({ error: 'Invalid or expired refresh token' });

        const existingToken = await UserRefreshToken.findOne({ refreshToken });

        if (!existingToken) return res.status(401).json({ error: 'Invalid refresh token' });

        if (!process.env.JWT_SECRET_REFRESH || !process.env.JWT_REFRESH_TOKEN_EXPIRES_IN)
            return res.status(500).json({ error: 'Internal server error' });

        const accessToken = jwt.sign({ userId: decodedRefreshToken.userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRES_IN });

        const newRefreshToken = jwt.sign({ userId: decodedRefreshToken.userId }, process.env.JWT_SECRET_REFRESH, {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
        });

        await UserRefreshToken.findOneAndUpdate({ user: decodedRefreshToken.userId }, { refreshToken: newRefreshToken }, { upsert: true, new: true });

        res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Refresh token invalid or expired' });
        }

        return res.status(500).json({ message: error.message });
    }
};

// Logout function
exports.logout = async (req, res) => {
    try {
        await UserRefreshToken.deleteMany({ user: req.user.id });
        await UserInvalidToken.create({ token: req.accessToken.value, userId: req.user.id, expirationTime: req.accessToken.exp });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
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
                user = new User({ googleId: profile.id, name: profile.displayName, email: profile.emails[0].value });
                await user.save();
            }
            done(null, user);
        }
    )
);

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });
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
                user = new User({ facebookId: profile.id, name: profile.displayName, email: profile.emails[0].value });
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
