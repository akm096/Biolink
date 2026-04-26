const express = require('express');
const { getDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/stats/me - get user's stats
router.get('/me', authMiddleware, (req, res) => {
  try {
    const db = getDb();

    const profile = db.prepare(
      'SELECT views, created_at, updated_at FROM profiles WHERE user_id = ?'
    ).get(req.userId);

    const linkStats = db.prepare(
      'SELECT COUNT(*) as total_links, SUM(click_count) as total_clicks FROM links WHERE user_id = ?'
    ).get(req.userId);

    const topLinks = db.prepare(
      'SELECT title, url, click_count, icon FROM links WHERE user_id = ? ORDER BY click_count DESC LIMIT 5'
    ).all(req.userId);

    const user = db.prepare('SELECT username FROM users WHERE id = ?').get(req.userId);

    res.json({
      stats: {
        total_views: profile?.views || 0,
        total_links: linkStats?.total_links || 0,
        total_clicks: linkStats?.total_clicks || 0,
        top_links: topLinks,
        profile_url: `/${user?.username}`,
        created_at: profile?.created_at,
        updated_at: profile?.updated_at
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
