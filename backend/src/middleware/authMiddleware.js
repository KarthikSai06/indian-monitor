const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'bharat-monitor-dev-secret-change-in-prod';

/**
 * Generate a JWT token for a user
 */
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Set JWT as httpOnly cookie on the response
 */
function setTokenCookie(res, token) {
  res.cookie('bm_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

/**
 * Clear the JWT cookie
 */
function clearTokenCookie(res) {
  res.cookie('bm_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 0,
    path: '/',
  });
}

/**
 * Extract token from cookie or Authorization: Bearer header.
 * Supports both same-domain (cookie) and cross-domain (header) auth.
 */
function extractToken(req) {
  if (req.cookies?.bm_token) return req.cookies.bm_token;
  const authHeader = req.headers?.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return null;
}

/**
 * Middleware: Require authentication — blocks request if not authenticated
 */
async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired, please login again' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Middleware: Optional auth — attaches user if token present, continues otherwise
 */
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    }
  } catch {
    // Token invalid — just continue without user
  }
  next();
}

module.exports = {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
  requireAuth,
  optionalAuth,
  requireVip,
  requireAdmin,
};

/**
 * Middleware: Require VIP tier — must be used AFTER requireAuth
 */
function requireVip(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.tier !== 'vip') {
    return res.status(403).json({
      error: 'VIP access required',
      message: 'This feature is only available to VIP members. Upgrade your plan to access AI-powered insights.',
      tier: req.user.tier,
    });
  }
  next();
}

/**
 * Middleware: Require admin — checks for ADMIN_EMAIL env var or a future isAdmin flag
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
  if (!adminEmails.includes(req.user.email.toLowerCase())) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
