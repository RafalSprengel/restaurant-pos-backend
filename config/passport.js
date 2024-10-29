const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const { User } = require('../db/models/User'); // Model użytkownika

// Local Strategy
// passport.use(
//     new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
//         try {
//             const user = await User.findOne({ email });
//             if (!user) return done(null, false, { message: 'Incorrect email or password.' });

//             const isMatch = await bcrypt.compare(password, user.password);
//             if (!isMatch) return done(null, false, { message: 'Incorrect email or password.' });

//             return done(null, user);
//         } catch (err) {
//             return done(err);
//         }
//     })
// );

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
                let user = await User.findOne({ googleId: profile.id });
                if (!user) {
                    user = new User({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                    });
                    await user.save();
                }
                return done(null, user);
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
                let user = await User.findOne({ facebookId: profile.id });
                if (!user) {
                    user = new User({
                        facebookId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                    });
                    await user.save();
                }
                return done(null, user);
            } catch (err) {
                return done(err, false);
            }
        }
    )
);

// Serializacja i deserializacja użytkownika
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
