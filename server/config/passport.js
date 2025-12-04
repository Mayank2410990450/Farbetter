const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.modal.js');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Google OAuth Strategy (only if credentials are set)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const callbackURL = `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`;

  console.log('✅ Google OAuth configured successfully');
  console.log('📍 Callback URL:', callbackURL);
  console.log('🔑 Client ID:', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('🔐 Google OAuth callback received');
          console.log('👤 Profile ID:', profile.id);

          const email = profile.emails && profile.emails[0] && profile.emails[0].value;
          const name = profile.displayName || profile.username || 'User';
          const picture = profile.photos && profile.photos[0] && profile.photos[0].value;

          console.log('📧 Email:', email);
          console.log('👤 Name:', name);

          if (!email) {
            console.error('❌ No email provided by Google');
            return done(new Error('No email provided by Google'), null);
          }

          let user = await User.findOne({ email });

          if (!user) {
            console.log('➕ Creating new user from Google profile');
            // Create user with available profile info
            user = await User.create({
              name,
              email: email,
              password: 'oauth_google', // placeholder
              avatar: picture || null,
              googleId: profile.id,
            });
            console.log('✅ New user created:', user._id);
          } else {
            console.log('✅ Existing user found:', user._id);
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
              console.log('🔗 Linked Google ID to existing user');
            }
          }

          return done(null, user);
        } catch (err) {
          console.error('❌ Google OAuth error:', err.message);
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn('⚠️  Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

module.exports = passport;
