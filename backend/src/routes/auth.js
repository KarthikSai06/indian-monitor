const express = require('express');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const User = require('../models/User');
const {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
  requireAuth,
} = require('../middleware/authMiddleware');

const router = express.Router();

// ── Helper: send validation errors ───────────────────────────────────────────
function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  return null;
}

// ── POST /api/auth/signup ────────────────────────────────────────────────────
router.post(
  '/signup',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ max: 100 }).withMessage('Name must be under 100 characters'),
    body('email')
      .trim()
      .isEmail().withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .isLength({ max: 128 }).withMessage('Password too long'),
  ],
  async (req, res) => {
    try {
      const validationError = handleValidationErrors(req, res);
      if (validationError) return;

      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          error: existingUser.provider !== 'local'
            ? `An account with this email already exists via ${existingUser.provider}. Try logging in with ${existingUser.provider}.`
            : 'An account with this email already exists. Please login instead.',
        });
      }

      // Create user
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        provider: 'local',
      });

      // Generate JWT and set cookie
      const token = generateToken(user);
      setTokenCookie(res, token);

      console.log(`\x1b[32m[Auth] New user registered: ${user.email}\x1b[0m`);

      res.status(201).json({
        message: 'Account created successfully',
        token,
        user: user.toJSON(),
      });
    } catch (err) {
      console.error('[Auth] Signup error:', err.message);
      res.status(500).json({ error: 'Server error during signup' });
    }
  }
);

// ── POST /api/auth/login ────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  (req, res, next) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        console.error('[Auth] Login error:', err.message);
        return res.status(500).json({ error: 'Server error during login' });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || 'Invalid credentials' });
      }

      const token = generateToken(user);
      setTokenCookie(res, token);

      console.log(`\x1b[36m[Auth] User logged in: ${user.email}\x1b[0m`);

      res.json({
        message: 'Logged in successfully',
        token,
        user: user.toJSON(),
      });
    })(req, res, next);
  }
);

// ── POST /api/auth/logout ───────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  clearTokenCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ── POST /api/auth/select-tier ───────────────────────────────────────────────
// Called from PlanSelect.jsx when user chooses Normal or requests VIP
router.post('/select-tier', requireAuth, async (req, res) => {
  const { tier } = req.body;
  if (!['normal', 'vip'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier. Must be "normal" or "vip"' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        tier,
        tierSetupDone: true,
      },
      { new: true }
    ).select('-password');

    console.log(`[Auth] User ${user.email} selected tier: ${tier}`);
    res.json({
      message: `Plan selected: ${tier}`,
      user,
    });
  } catch (err) {
    console.error('[Auth] select-tier error:', err.message);
    res.status(500).json({ error: 'Failed to save tier preference' });
  }
});

// ── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put(
  '/profile',
  requireAuth,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  ],
  async (req, res) => {
    try {
      const validationError = handleValidationErrors(req, res);
      if (validationError) return;

      const updates = {};
      if (req.body.name) updates.name = req.body.name;
      if (req.body.avatar !== undefined) updates.avatar = req.body.avatar;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({ message: 'Profile updated', user });
    } catch (err) {
      console.error('[Auth] Profile update error:', err.message);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

// ── PUT /api/auth/change-password ────────────────────────────────────────────
router.put(
  '/change-password',
  requireAuth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
      .isLength({ max: 128 }).withMessage('Password too long'),
  ],
  async (req, res) => {
    try {
      const validationError = handleValidationErrors(req, res);
      if (validationError) return;

      const user = await User.findById(req.user._id);
      if (!user.password) {
        return res.status(400).json({
          error: `Your account uses ${user.provider} login. You cannot set a password here.`,
        });
      }

      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      user.password = req.body.newPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      console.error('[Auth] Password change error:', err.message);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
);

// ── Google OAuth ─────────────────────────────────────────────────────────────
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ error: 'Google OAuth is not configured' });
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        console.error('[Auth] Google OAuth error:', err.message);
        return res.redirect(`${frontendURL}/auth?error=google_failed`);
      }
      if (!user) {
        console.error('[Auth] Google OAuth failed:', info?.message || 'No user returned');
        return res.redirect(`${frontendURL}/auth?error=google_failed`);
      }

      const token = generateToken(user);
      // Also set cookie (works for same-domain / local dev)
      setTokenCookie(res, token);
      console.log(`\x1b[32m[Auth] Google login: ${user.email}\x1b[0m`);

      // Pass token as URL param so the frontend can store it regardless of
      // cross-domain cookie restrictions (Vercel frontend ≠ Render backend)
      res.redirect(`${frontendURL}/?auth=success&token=${token}`);
    })(req, res, next);
  }
);

module.exports = router;
