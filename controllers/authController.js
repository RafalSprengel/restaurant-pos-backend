const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../db/models/User');
const Customer = require('../db/models/Customer');
const UserRefreshToken = require('../db/models/UserRefreshToken');
const UserInvalidToken = require('../db/models/UserInvalidToken');

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            userName: user.name,
            userSurname: user.surname,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
        }
    );
};

// Sysytem customer registration function
exports.registerNewCustomer = async (req, res) => {
    const { name, surname, email, password } = req.body;
    if (!name || !surname || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    let customer = await Customer.findOne({ email });
    if (customer) {
        return res.status(409).json({ error: 'This email is already registered' });
    }
    try {
        customer = new Customer({ name, surname, email, password });
        await customer.save();
        res.status(201).json({
            message: 'Customer has been successfully registered, you can log in now using your credentials',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error during registration' });
    }
};

exports.loginCustomer = async (req, res) => {
    const { email, password } = req.body;

    // Sprawdzamy, czy wszystkie wymagane dane są w żądaniu
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

        const token = generateToken(customer);

        const refreshToken = jwt.sign({ userId: customer._id }, process.env.JWT_SECRET_REFRESH, {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
        });

        await UserRefreshToken.findOneAndUpdate({ userId: customer._id }, { refreshToken }, { upsert: true });

        res.cookie('jwt', token, {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, // 1 godzina
            sameSite: 'Lax',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            path: '/api/auth/refreshToken',
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
exports.registerNewSystemUser = async (req, res) => {
    const { name, surname, email, role, password } = req.body;
    if (!name || !surname || !email || !password) return res.status(422).json({ error: 'Missing required fields' });

    try {
        if (!process.env.JWT_SECRET || !process.env.JWT_TOKEN_EXPIRES_IN) return res.status(500).json({ error: 'Internal server error' });

        let user = await User.findOne({ email });
        if (user) return res.status(409).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            name,
            surname,
            email,
            role,
            password: hashedPassword,
        });

        await user.save();
        res.status(201).json({
            message: 'User registered, you can log in now using your credentials',
            userId: user._id,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error during registration' });
    }
};

// Local login function
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(422).json({ error: 'Missing required fields' });

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = generateToken(user);

        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_REFRESH, {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
        });

        await UserRefreshToken.findOneAndUpdate({ userId: user._id }, { refreshToken }, { upsert: true });

        res.cookie('jwt', token, {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, //1h
            sameSite: 'Lax',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            path: '/api/auth/refreshToken',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 * 24 * 15, //15days
            sameSite: 'Lax',
        });
        res.status(200).json({
            _id: user._id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            role: user.role,
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
        const accessToken = req.cookies.jwt; // Zmieniona nazwa zmiennej

        if (!refreshToken) return res.status(401).json({ error: 'Missing refresh token' });

        // Użycie modułu `jsonwebtoken` bez nadpisywania nazwy
        const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);

        if (!decodedRefreshToken) return res.status(401).json({ error: 'Invalid or expired refresh token' });

        const existingToken = await UserRefreshToken.findOne({
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

        await UserRefreshToken.findOneAndUpdate({ userId: decodedRefreshToken.userId }, { refreshToken: newRefreshToken }, { upsert: true, new: true });
        res.cookie('jwt', newAccessToken, {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, //1h
            sameSite: 'Lax',
        });
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            path: '/api/auth/refreshToken',
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
exports.logoutUser = async (req, res) => {
    try {
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
            path: '/api/auth/refreshToken',
        });

        await UserRefreshToken.deleteMany({ userId: req.user._id });

        await UserInvalidToken.create({
            token: req.cookies.jwt,
            userId: req.user._id,
            expirationTime: req.accessToken.exp,
        });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// customer Logout function
exports.logoutCustomer = async (req, res) => {
    try {
        // Usuwanie ciasteczek
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
            path: '/api/auth/refreshToken',
        });

        // Usunięcie refresh tokenu z bazy danych
        await CustomerRefreshToken.deleteMany({ customerId: req.user._id });

        // Dodanie tokenu do tabeli z nieaktualnymi tokenami
        await CustomerInvalidToken.create({
            token: req.cookies.jwt,
            customerId: req.user._id,
            expirationTime: req.accessToken.exp,
        });

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
