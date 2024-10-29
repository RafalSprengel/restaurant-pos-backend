const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../db/models/User');

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Registration function
exports.register = async (req, res) => {
    const { name, surname, email, password } = req.body;
    console.log('Received registration request:', req.body);
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({ name, surname, email, password: hashedPassword });

        await user.save();

        if (!user) {
            throw new Error('User not saved');
        }

        const token = generateToken(user);

        res.status(201).json({ message: 'User registered', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error during registration' });
    }
};

// Local login function
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' }); // Logujemy zhaszowane hasło z bazy

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = generateToken(user);
        res.status(200).json({ message: 'Logged in successfully', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error during login' });
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
