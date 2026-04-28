const express = require('express');
const { getDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { validateUrl, sanitizeString } = require('../utils/validators');

const router = express.Router();

const EMAIL_LINK_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeLinkUrl(value) {
  const trimmed = String(value || '').trim();
  return EMAIL_LINK_REGEX.test(trimmed) ? `mailto:${trimmed}` : trimmed;
}

// GET /api/links - get user's links
router.get('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const links = db.prepare(
      'SELECT * FROM links WHERE user_id = ? ORDER BY position ASC'
    ).all(req.userId);
    res.json({ links });
  } catch (err) {
    console.error('Get links error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/links - create a new link
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title, url, type, icon, color, is_visible, is_featured } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    const normalizedUrl = normalizeLinkUrl(url);
    const urlErr = validateUrl(normalizedUrl);
    if (urlErr) return res.status(400).json({ error: urlErr });

    const db = getDb();

    // Get next position
    const maxPos = db.prepare(
      'SELECT MAX(position) as max_pos FROM links WHERE user_id = ?'
    ).get(req.userId);
    const position = (maxPos?.max_pos ?? -1) + 1;

    const result = db.prepare(`
      INSERT INTO links (user_id, title, url, type, icon, color, is_visible, is_featured, position)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.userId,
      sanitizeString(title),
      normalizedUrl,
      type || 'link',
      icon || 'link',
      color || '',
      is_visible !== undefined ? (is_visible ? 1 : 0) : 1,
      is_featured ? 1 : 0,
      position
    );

    const link = db.prepare('SELECT * FROM links WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ link });
  } catch (err) {
    console.error('Create link error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/links/:id - update a link
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const link = db.prepare(
      'SELECT * FROM links WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.userId);

    if (!link) return res.status(404).json({ error: 'Link not found' });

    const { title, url, type, icon, color, is_visible, is_featured, position } = req.body;

    if (url) {
      const normalizedUrl = normalizeLinkUrl(url);
      const urlErr = validateUrl(normalizedUrl);
      if (urlErr) return res.status(400).json({ error: urlErr });
    }

    const normalizedUrl = url !== undefined ? normalizeLinkUrl(url) : null;

    db.prepare(`
      UPDATE links SET
        title = COALESCE(?, title),
        url = COALESCE(?, url),
        type = COALESCE(?, type),
        icon = COALESCE(?, icon),
        color = COALESCE(?, color),
        is_visible = COALESCE(?, is_visible),
        is_featured = COALESCE(?, is_featured),
        position = COALESCE(?, position),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(
      title !== undefined ? sanitizeString(title) : null,
      normalizedUrl,
      type !== undefined ? type : null,
      icon !== undefined ? icon : null,
      color !== undefined ? color : null,
      is_visible !== undefined ? (is_visible ? 1 : 0) : null,
      is_featured !== undefined ? (is_featured ? 1 : 0) : null,
      position !== undefined ? position : null,
      req.params.id,
      req.userId
    );

    const updated = db.prepare('SELECT * FROM links WHERE id = ?').get(req.params.id);
    res.json({ link: updated });
  } catch (err) {
    console.error('Update link error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/links/:id - delete a link
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const link = db.prepare(
      'SELECT id FROM links WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.userId);

    if (!link) return res.status(404).json({ error: 'Link not found' });

    db.prepare('DELETE FROM links WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.userId);

    res.json({ success: true });
  } catch (err) {
    console.error('Delete link error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/links/reorder - reorder links
router.post('/reorder', authMiddleware, (req, res) => {
  try {
    const { linkIds } = req.body;
    if (!Array.isArray(linkIds)) {
      return res.status(400).json({ error: 'linkIds array required' });
    }

    const db = getDb();
    const updatePos = db.prepare(
      'UPDATE links SET position = ? WHERE id = ? AND user_id = ?'
    );

    const reorder = db.transaction((ids) => {
      ids.forEach((id, index) => {
        updatePos.run(index, id, req.userId);
      });
    });
    reorder(linkIds);

    const links = db.prepare(
      'SELECT * FROM links WHERE user_id = ? ORDER BY position ASC'
    ).all(req.userId);

    res.json({ links });
  } catch (err) {
    console.error('Reorder links error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/links/:id/click - track link click (public)
router.post('/:id/click', (req, res) => {
  try {
    const db = getDb();
    const link = db.prepare('SELECT id, url FROM links WHERE id = ?').get(req.params.id);

    if (!link) return res.status(404).json({ error: 'Link not found' });

    db.prepare('UPDATE links SET click_count = click_count + 1 WHERE id = ?')
      .run(req.params.id);

    res.json({ success: true });
  } catch (err) {
    console.error('Click track error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
