const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// ── Serialize / Deserialize ──────────────────────────────────────────────────
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ── Local Strategy (Email & Password) ────────────────────────────────────────
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          return done(null, false, { message: 'No account found with this email' });
        }
        if (!user.password) {
          return done(null, false, {
            message: `This account uses ${user.provider} login. Please sign in with ${user.provider}.`,
          });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }
        user.lastLogin = new Date();
        await user.save();
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// ── Google OAuth 2.0 Strategy ────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: (process.env.BACKEND_URL || 'http://localhost:3001') + '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(null, false, { message: 'No email from Google' });

          // Check if user exists with this email
          let user = await User.findOne({ email: email.toLowerCase() });

          if (user) {
            // Update provider info if they previously used local auth
            if (user.provider === 'local' && !user.providerId) {
              user.provider = 'google';
              user.providerId = profile.id;
              user.avatar = user.avatar || profile.photos?.[0]?.value || null;
            }
            user.lastLogin = new Date();
            await user.save();
          } else {
            // Create new user
            user = await User.create({
              name: profile.displayName || email.split('@')[0],
              email: email.toLowerCase(),
              provider: 'google',
              providerId: profile.id,
              avatar: profile.photos?.[0]?.value || null,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  console.log('\x1b[32m[Auth] Google OAuth strategy loaded\x1b[0m');
} else {
  console.log('\x1b[33m[Auth] Google OAuth disabled (no credentials in .env)\x1b[0m');
}

module.exports = passport;
