const express = require('express');
const VipInsight = require('../models/VipInsight');
const VipIncident = require('../models/VipIncident');
const { requireAuth, requireVip, requireAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// ── GET /api/vip/incidents ───────────────────────────────────────────────────
// Returns Ollama-generated incident map data for VIP users.
router.get('/incidents', requireAuth, requireVip, async (req, res) => {
  try {
    const doc = await VipIncident.findOne({}).sort({ createdAt: -1 }).lean();
    if (!doc) {
      return res.json({ incidents: [], generatedAt: null, message: 'No incidents yet — Ollama worker will generate on next cycle.' });
    }
    res.json({ incidents: doc.incidents, generatedAt: doc.generatedAt, count: doc.incidents.length });
  } catch (err) {
    console.error('[VIP] Failed to fetch incidents:', err.message);
    res.status(500).json({ error: 'Failed to load VIP incidents' });
  }
});

// ── POST /api/vip/incidents/trigger ──────────────────────────────────────────
// Admin only: manually triggers an Ollama incident generation run (for testing)
router.post('/incidents/trigger', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { runOllamaWorker } = require('../services/ollamaWorker');
    res.json({ message: 'Ollama worker triggered. Check backend logs.' });
    // Run async — don't block the response
    runOllamaWorker().catch(err => console.error('[VIP] Trigger error:', err.message));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/vip/insights ─────────────────────────────────────────────────────
// Returns all VIP AI insights. Requires VIP tier.
router.get('/insights', requireAuth, requireVip, async (req, res) => {
  try {
    const insights = await VipInsight.find({})
      .sort({ generatedAt: -1 })
      .lean();

    res.json({
      insights,
      generatedAt: insights[0]?.generatedAt || null,
      count: insights.length,
    });
  } catch (err) {
    console.error('[VIP] Failed to fetch insights:', err.message);
    res.status(500).json({ error: 'Failed to load VIP insights' });
  }
});

// ── GET /api/vip/insights/:category ──────────────────────────────────────────
// Returns a single category's insight. Requires VIP tier.
router.get('/insights/:category', requireAuth, requireVip, async (req, res) => {
  try {
    const insight = await VipInsight.findOne({ category: req.params.category }).lean();
    if (!insight) {
      return res.status(404).json({ error: 'No insight found for this category yet' });
    }
    res.json({ insight });
  } catch (err) {
    console.error('[VIP] Failed to fetch insight:', err.message);
    res.status(500).json({ error: 'Failed to load insight' });
  }
});

// ── POST /api/vip/admin/upgrade ───────────────────────────────────────────────
// Admin only: upgrades a user to VIP by their email address
router.post('/admin/upgrade', requireAuth, requireAdmin, async (req, res) => {
  const { email, tier } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const targetTier = tier === 'normal' ? 'normal' : 'vip';
  try {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { tier: targetTier, tierSetupDone: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[VIP] Admin upgraded ${user.email} to tier: ${targetTier}`);
    res.json({
      message: `User ${user.email} has been set to ${targetTier} tier`,
      user,
    });
  } catch (err) {
    console.error('[VIP] Admin upgrade error:', err.message);
    res.status(500).json({ error: 'Failed to update user tier' });
  }
});

// ── GET /api/vip/admin/users ──────────────────────────────────────────────────
// Admin only: lists all users with their tier status
router.get('/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email tier tierSetupDone createdAt lastLogin')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ users, total: users.length });
  } catch (err) {
    console.error('[VIP] Admin list users error:', err.message);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

module.exports = router;
