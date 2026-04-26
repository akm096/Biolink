const express = require('express');
const { getDb } = require('../db/database');
const { adminMiddleware } = require('../middleware/auth');
const { validateUsername, validateEmail, sanitizeString } = require('../utils/validators');

const router = express.Router();

// All routes here require admin access
router.use(adminMiddleware);

// GET /api/admin/stats - Platform-wide statistics
router.get('/stats', (req, res) => {
  try {
    const db = getDb();
    
    const stats = {
      total_users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
      total_links: db.prepare('SELECT COUNT(*) as count FROM links').get().count,
      total_views: db.prepare('SELECT SUM(views) as count FROM profiles').get().count || 0,
      total_clicks: db.prepare('SELECT SUM(click_count) as count FROM links').get().count || 0,
      new_users_today: db.prepare("SELECT COUNT(*) as count FROM users WHERE date(created_at) = date('now')").get().count,
      active_visits: db.prepare('SELECT COUNT(*) as count FROM visit_logs').get().count
    };

    res.json({ stats });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

// GET /api/admin/users - List all users
router.get('/users', (req, res) => {
  try {
    const db = getDb();
    const { search = '' } = req.query;

    let query = `
      SELECT 
        u.id, u.username, u.email, u.role, u.last_login_ip, u.last_login_at, u.created_at,
        p.display_name, p.avatar_url, p.views, p.is_verified,
        (SELECT COUNT(*) FROM links l WHERE l.user_id = u.id) as link_count,
        (SELECT SUM(click_count) FROM links l WHERE l.user_id = u.id) as total_clicks
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
    `;
    
    let params = [];
    if (search) {
      query += ` WHERE u.username LIKE ? OR u.email LIKE ? OR p.display_name LIKE ?`;
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    
    query += ` ORDER BY u.created_at DESC`;

    const users = db.prepare(query).all(...params);
    res.json({ users });
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// GET /api/admin/users/:id - Get detailed user info
router.get('/users/:id', (req, res) => {
  try {
    const db = getDb();
    const userId = req.params.id;

    const user = db.prepare('SELECT id, username, email, role, last_login_ip, last_login_at, created_at FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
    const badges = db.prepare('SELECT badge_type FROM badges WHERE user_id = ?').all(userId).map(b => b.badge_type);
    
    res.json({ user, profile, badges });
  } catch (err) {
    console.error('Admin get user error:', err);
    res.status(500).json({ error: 'Server error fetching user details' });
  }
});

// PUT /api/admin/users/:id - Update user/profile
router.put('/users/:id', (req, res) => {
  try {
    const db = getDb();
    const userId = req.params.id;
    const { 
      username, email, role, 
      display_name, bio, views, is_verified, 
      badges
    } = req.body;

    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!existingUser) return res.status(404).json({ error: 'User not found' });

    // 1. Update User Table
    if (username || email || role) {
      if (username) {
        const usernameErr = validateUsername(username);
        if (usernameErr) return res.status(400).json({ error: usernameErr });
      }
      if (email) {
        const emailErr = validateEmail(email);
        if (emailErr) return res.status(400).json({ error: emailErr });
      }

      // Check uniqueness
      const existingConflict = db.prepare('SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?').get(
        username ? username.toLowerCase() : '', 
        email ? email.toLowerCase() : '', 
        userId
      );
      if (existingConflict) {
        return res.status(409).json({ error: 'Username or email already taken' });
      }

      db.prepare(`
        UPDATE users SET 
          username = COALESCE(?, username),
          email = COALESCE(?, email),
          role = COALESCE(?, role),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        username ? username.toLowerCase() : null,
        email ? email.toLowerCase() : null,
        role || null,
        userId
      );
    }

    // 2. Update Profile Table
    if (display_name !== undefined || bio !== undefined || views !== undefined || is_verified !== undefined) {
      db.prepare(`
        UPDATE profiles SET
          display_name = COALESCE(?, display_name),
          bio = COALESCE(?, bio),
          views = COALESCE(?, views),
          is_verified = COALESCE(?, is_verified),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        display_name !== undefined ? sanitizeString(display_name) : null,
        bio !== undefined ? sanitizeString(bio) : null,
        views !== undefined ? parseInt(views, 10) : null,
        is_verified !== undefined ? (is_verified ? 1 : 0) : null,
        userId
      );
    }

    // 3. Update Badges
    if (badges && Array.isArray(badges)) {
      db.prepare('DELETE FROM badges WHERE user_id = ?').run(userId);
      const insertBadge = db.prepare('INSERT INTO badges (user_id, badge_type) VALUES (?, ?)');
      for (const badge of badges) {
        insertBadge.run(userId, badge);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ error: 'Server error updating user' });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', (req, res) => {
  try {
    const db = getDb();
    const userId = req.params.id;

    // Don't allow admin to delete themselves
    if (userId.toString() === req.userId.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    
    if (result.changes === 0) {
       return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ error: 'Server error deleting user' });
  }
});

// GET /api/admin/visits - List recent visits
router.get('/visits', (req, res) => {
  try {
    const db = getDb();
    const visits = db.prepare(`
      SELECT v.*, u.username as visited_profile
      FROM visit_logs v
      LEFT JOIN users u ON u.id = v.user_id
      ORDER BY v.created_at DESC
      LIMIT 100
    `).all();
    
    res.json({ visits });
  } catch (err) {
    console.error('Admin get visits error:', err);
    res.status(500).json({ error: 'Server error fetching visits' });
  }
});

module.exports = router;
