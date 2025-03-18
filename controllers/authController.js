const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const RefreshToken = require('../db/models/RefreshToken');
const Customer = require('../db/models/Customer');
const {Staff} = require('../db/models/Staff');
const jwtAccessTokenMaxAge = parseInt(process.env.JWT_ACCESS_TOKEN_MAX_AGE) || 3600;  // default 1h
const jwtRefreshTokenMaxAge = parseInt(process.env.JWT_REFRESH_TOKEN_MAX_AGE) || 3600 * 24 * 15;  // default 15 days

const generateToken = (user) => {
    const payload = {
        _id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: jwtAccessTokenMaxAge, 
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_REFRESH, {
        expiresIn: jwtRefreshTokenMaxAge,
    });

    return { token, refreshToken }; 
};

exports.registerCustomer = async (req, res) =>  {
    const { name, surname, email, password } = req.body;
    if (!name || !surname || !email || !password) return res.status(422).json({ error: 'Missing required fields' });

    try {
        if (!process.env.JWT_SECRET ) return res.status(500).json({ error: 'no process.env.JWT_SECRET, check .env file' });

        let customer = await Customer.findOne({ email });
        if (customer) return res.status(409).json({ error: 'Customer already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        customer = new Customer({
            name,
            surname,
            email,
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
};

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
            maxAge: jwtAccessTokenMaxAge * 1000,// in milliseconds
            sameSite: 'Lax',
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            path: '/v1/auth/refresh-token',
            secure:  process.env.NODE_ENV === 'production',
           maxAge: jwtRefreshTokenMaxAge *1000,// in milliseconds
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

exports.registerMgmt = async (req, res) => {
    const { name, surname, email, role, password } = req.body;
    if (!name || !surname || !email || !password) return res.status(422).json({ error: 'Missing required fields' });

    try {
        if (!process.env.JWT_SECRET ) return res.status(500).json({ error: 'no process.env.JWT_SECRET, check .env file' });

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

exports.loginMgmt = async (req, res) => {
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
            maxAge: jwtAccessTokenMaxAge *1000,// in milliseconds
            sameSite: 'Lax',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            path: '/v1/auth/refresh-token',
            secure: process.env.NODE_ENV === 'production',
            maxAge: jwtRefreshTokenMaxAge*1000,// in milliseconds
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

exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ error: 'Missing refresh token' });
        let decodedRefreshToken;
        try {
            decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
        } catch (error) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
        const userId = decodedRefreshToken._id;

        if(!(await RefreshToken.findOne({userId, refreshToken}))) return res.status(401).json({message:'refresh token not found in db'})
        
        let user = await Customer.findById(userId);
        if (!user) {
            user = await Staff.findById(userId);
        }

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const { token: newAccessToken, refreshToken: newRefreshToken } = generateToken(user);

        await RefreshToken.findOneAndUpdate({ userId }, { refreshToken: newRefreshToken }, { upsert: true, new: true });

        res.cookie('jwt', newAccessToken, {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: jwtAccessTokenMaxAge*1000, // in milliseconds
            sameSite: 'Lax',
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            path: '/v1/auth/refresh-token',
            secure: process.env.NODE_ENV === 'production',
            maxAge: jwtRefreshTokenMaxAge*1000,// in milliseconds
            sameSite: 'Lax',
        });

        res.status(200).json({ message: 'Jwt and refreshToken refreshed' });
    } catch (error) {
        // Obsługa innych błędów
        return res.status(500).json({ message: error.message });
    }
};

exports.session = async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    res.json({
        _id: req.user._id,
        name: req.user.name,
        surname:req.user.surname,
        email:req.user.email,
        role:req.user.role,
    });
};

exports.logout = async (req, res) => {
    try {
        const currentToken = req.cookies.jwt;

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
            path: '/v1/auth/refresh-token',
        });

        if (req.user && req.user._id && currentToken) {
            await RefreshToken.deleteMany({ userId: req.user._id });
        }

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Somethings went wrong during logging out:', error);
        res.status(500).json({ message: 'Logged out UNSUCCESSFULLY!' });
    }
};

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/v1/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            let user = await Customer.findOne({ googleId: profile.id });
            if (!user) {
                user = new Customer({
                    googleId: profile.id,
                    name: profile.displayName,
                    surname: profile.name.familyName, 
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
    
    res.cookie('jwt', token.token, {
        httpOnly: true, 
        path: '/',
        secure: process.env.NODE_ENV === 'production', 
        maxAge: jwtAccessTokenMaxAge * 1000,// in milliseconds
        sameSite: 'Lax',
    });

    res.cookie('refreshToken', token.refreshToken, {
        httpOnly: true,
        path: '/v1/auth/refresh-token',
        secure: process.env.NODE_ENV === 'production',
        maxAge: jwtRefreshTokenMaxAge *1000,// in milliseconds
        sameSite: 'Lax',
    });

    const origin = req.get('Origin') || 'http://localhost:3000';
    res.redirect(`${origin}/customer`);
};


passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: '/v1/auth/facebook/callback',
            profileFields: ['id', 'displayName', 'emails'],
        },
        async (accessToken, refreshToken, profile, done) => {
            let user = await Customer.findOne({ facebookId: profile.id });
            if (!user) {
                user = new Customer({
                    facebookId: profile.id,
                    name: profile.displayName,
                    surname: profile.name.familyName || '',
                    email: profile.emails[0].value,
                });
                await user.save();
            }
            done(null, user);
        }
    )
);

exports.facebookAuth = passport.authenticate('facebook', { scope: ['email', 'public_profile'] });

exports.facebookCallback = (req, res) => {
    const token = generateToken(req.user);
    
    res.cookie('jwt', token.token, {
        httpOnly: true, 
        path: '/',
        secure: process.env.NODE_ENV === 'production', 
        maxAge: jwtAccessTokenMaxAge * 1000,// in milliseconds
        sameSite: 'Lax',
    });

    res.cookie('refreshToken', token.refreshToken, {
        httpOnly: true,
        path: '/v1/auth/refresh-token',
        secure: process.env.NODE_ENV === 'production',
        maxAge: jwtRefreshTokenMaxAge *1000,// in milliseconds
        sameSite: 'Lax',
    });

    const origin = req.get('Origin') || 'http://localhost:3000';
    res.redirect(`${origin}/customer`);
};
