const express = require('express');
const { getDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { validateUsername, validateUrl, sanitizeString } = require('../utils/validators');
const { lookupIp, getClientIp } = require('../utils/geoip');

const router = express.Router();

// GET /api/profile/me - get own profile (authenticated)
router.get('/me', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const profile = db.prepare(`
      SELECT p.*, u.username, u.email
      FROM profiles p
      JOIN users u ON u.id = p.user_id
      WHERE p.user_id = ?
    `).get(req.userId);

    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const badges = db.prepare(
      'SELECT badge_type FROM badges WHERE user_id = ?'
    ).all(req.userId).map(b => b.badge_type);

    res.json({ profile: { ...profile, badges } });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/profile/me - update own profile
router.put('/me', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const {
      display_name, bio, avatar_url,
      background_image_url, background_video_url,
      music_url, music_title, music_artist,
      location, template, accent_color,
      show_enter_overlay, show_view_count,
      enable_effects, badges, username
    } = req.body;

    // If username change requested, validate it
    if (username !== undefined) {
      const usernameErr = validateUsername(username);
      if (usernameErr) return res.status(400).json({ error: usernameErr });

      const existing = db.prepare(
        'SELECT id FROM users WHERE username = ? AND id != ?'
      ).get(username.toLowerCase(), req.userId);
      if (existing) {
        return res.status(409).json({ error: 'Username already taken' });
      }

      db.prepare('UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(username.toLowerCase(), req.userId);
    }

    // Validate URLs if provided
    for (const url of [avatar_url, background_image_url, background_video_url, music_url]) {
      if (url) {
        const urlErr = validateUrl(url);
        if (urlErr) return res.status(400).json({ error: urlErr });
      }
    }

    db.prepare(`
      UPDATE profiles SET
        display_name = COALESCE(?, display_name),
        bio = COALESCE(?, bio),
        avatar_url = COALESCE(?, avatar_url),
        background_image_url = COALESCE(?, background_image_url),
        background_video_url = COALESCE(?, background_video_url),
        music_url = COALESCE(?, music_url),
        music_title = COALESCE(?, music_title),
        music_artist = COALESCE(?, music_artist),
        location = COALESCE(?, location),
        template = COALESCE(?, template),
        accent_color = COALESCE(?, accent_color),
        show_enter_overlay = COALESCE(?, show_enter_overlay),
        show_view_count = COALESCE(?, show_view_count),
        enable_effects = COALESCE(?, enable_effects),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      display_name !== undefined ? sanitizeString(display_name) : null,
      bio !== undefined ? sanitizeString(bio) : null,
      avatar_url !== undefined ? avatar_url : null,
      background_image_url !== undefined ? background_image_url : null,
      background_video_url !== undefined ? background_video_url : null,
      music_url !== undefined ? music_url : null,
      music_title !== undefined ? sanitizeString(music_title) : null,
      music_artist !== undefined ? sanitizeString(music_artist) : null,
      location !== undefined ? sanitizeString(location) : null,
      template !== undefined ? template : null,
      accent_color !== undefined ? accent_color : null,
      show_enter_overlay !== undefined ? (show_enter_overlay ? 1 : 0) : null,
      show_view_count !== undefined ? (show_view_count ? 1 : 0) : null,
      enable_effects !== undefined ? (enable_effects ? 1 : 0) : null,
      req.userId
    );

    // Update badges if provided — protect admin-only badges
    if (badges && Array.isArray(badges)) {
      const ADMIN_ONLY_BADGES = ['verified', 'early_user'];
      const USER_ALLOWED_BADGES = ['creator', 'developer', 'music', 'gamer'];

      // Preserve admin-only badges from DB (user cannot add or remove them)
      const existingAdminBadges = db.prepare(
        'SELECT badge_type FROM badges WHERE user_id = ? AND badge_type IN (?, ?)'
      ).all(req.userId, ...ADMIN_ONLY_BADGES).map(b => b.badge_type);

      // Only keep user-allowed badges from the request
      const userBadges = badges.filter(b => USER_ALLOWED_BADGES.includes(b));

      // Merge: admin-only from DB + user-selected
      const finalBadges = [...new Set([...existingAdminBadges, ...userBadges])];

      db.prepare('DELETE FROM badges WHERE user_id = ?').run(req.userId);
      const insertBadge = db.prepare('INSERT INTO badges (user_id, badge_type) VALUES (?, ?)');
      for (const badge of finalBadges) {
        insertBadge.run(req.userId, badge);
      }
    }

    // Re-fetch updated profile
    const profile = db.prepare(`
      SELECT p.*, u.username, u.email
      FROM profiles p
      JOIN users u ON u.id = p.user_id
      WHERE p.user_id = ?
    `).get(req.userId);

    const updatedBadges = db.prepare(
      'SELECT badge_type FROM badges WHERE user_id = ?'
    ).all(req.userId).map(b => b.badge_type);

    res.json({ profile: { ...profile, badges: updatedBadges } });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/profile/check/:username - check username availability
router.get('/check/:username', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const usernameErr = validateUsername(req.params.username);
    if (usernameErr) return res.json({ available: false, error: usernameErr });

    const existing = db.prepare(
      'SELECT id FROM users WHERE username = ? AND id != ?'
    ).get(req.params.username.toLowerCase(), req.userId);

    res.json({ available: !existing });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/profile/:username - get public profile
router.get('/:username', async (req, res) => {
  try {
    const db = getDb();
    const { username } = req.params;

    const user = db.prepare('SELECT id, username FROM users WHERE username = ?')
      .get(username.toLowerCase());

    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Increment view count
    db.prepare('UPDATE profiles SET views = views + 1 WHERE user_id = ?').run(user.id);

    // Track visitor
    const clientIp = getClientIp(req);
    if (clientIp) {
      // Don't await to not block the request
      lookupIp(clientIp).then(geo => {
        try {
          db.prepare('INSERT INTO visit_logs (user_id, visitor_ip, country, city) VALUES (?, ?, ?, ?)')
            .run(user.id, clientIp, geo.country, geo.city);
        } catch (e) {
          console.error('Failed to log visit:', e);
        }
      });
    }

    const links = db.prepare(
      'SELECT id, title, url, type, icon, color, is_visible, is_featured, position, click_count FROM links WHERE user_id = ? AND is_visible = 1 ORDER BY position ASC'
    ).all(user.id);

    const badges = db.prepare(
      'SELECT badge_type FROM badges WHERE user_id = ?'
    ).all(user.id).map(b => b.badge_type);

    // Don't expose internal IDs or sensitive data
    res.json({
      profile: {
        username: user.username,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        background_image_url: profile.background_image_url,
        background_video_url: profile.background_video_url,
        music_url: profile.music_url,
        music_title: profile.music_title,
        music_artist: profile.music_artist,
        location: profile.location,
        template: profile.template,
        accent_color: profile.accent_color,
        show_enter_overlay: profile.show_enter_overlay,
        show_view_count: profile.show_view_count,
        enable_effects: profile.enable_effects,
        is_verified: profile.is_verified,
        views: profile.views + 1, // Include current view
        created_at: profile.created_at,
        badges,
        links
      }
    });
  } catch (err) {
    console.error('Get public profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
