const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const { Customer } = require('../db/models/Customer'); // Model użytkownika

// Local Strategy
passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const customer = await Customer.findOne({ email });
            if (!customer) return done(null, false, { message: 'Incorrect email or password.' });

            const isMatch = await bcrypt.compare(password, customer.password);
            if (!isMatch) return done(null, false, { message: 'Incorrect email or password.' });

            return done(null, customer);
        } catch (err) {
            return done(err);
        }
    })
);

// Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
            passReqToCallback: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let customer = await Customer.findOne({ googleId: profile.id });
                if (!customer) {
                    customer = new Customer({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                    });
                    await customer.save();
                }
                return done(null, customer);
            } catch (err) {
                return done(err, false);
            }
        }
    )
);

// Facebook Strategy
passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: '/auth/facebook/callback',
            profileFields: ['id', 'displayName', 'emails'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let customer = await Customer.findOne({ facebookId: profile.id });
                if (!customer) {
                    customer = new Customer({
                        facebookId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                    });
                    await customer.save();
                }
                return done(null, customer);
            } catch (err) {
                return done(err, false);
            }
        }
    )
);

// Serializacja i deserializacja użytkownika
passport.serializeUser((customer, done) => done(null, customer.id));

passport.deserializeUser(async (id, done) => {
    try {
        const customer = await Customer.findById(id);
        done(null, customer);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
