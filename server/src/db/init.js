/**
 * Database initialization & seed script
 * Run: node src/db/init.js
 * Creates tables and inserts demo user data
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const bcrypt = require('bcryptjs');
const { getDb, closeDb } = require('./database');

async function seed() {
  const db = getDb();
  console.log('✓ Database initialized');

  // Check if demo user exists
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('demo');
  if (existing) {
    console.log('✓ Demo user already exists, skipping seed');
    closeDb();
    return;
  }

  const hash = await bcrypt.hash('demo123', 10);

  // Create demo user
  const userResult = db.prepare(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
  ).run('demo', 'demo@example.com', hash);

  const userId = userResult.lastInsertRowid;

  // Create demo profile
  db.prepare(`
    INSERT INTO profiles (
      user_id, display_name, bio, avatar_url,
      background_image_url, background_video_url,
      music_url, music_title, music_artist,
      location, template, accent_color,
      show_enter_overlay, show_view_count, enable_effects,
      is_verified, views
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    'Demo User',
    '✨ Welcome to my profile! This is a demo bio-link page. Click the links below to explore.',
    'https://api.dicebear.com/9.x/glass/svg?seed=demo&backgroundColor=a855f7',
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80',
    '',
    '',
    'Chill Vibes',
    'Lo-fi Beats',
    '🌍 Internet',
    'neon-purple',
    '#a855f7',
    1, 1, 1, 1, 42
  );

  // Create demo links
  const insertLink = db.prepare(`
    INSERT INTO links (user_id, title, url, type, icon, color, is_visible, is_featured, position, click_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const demoLinks = [
    [userId, 'Instagram', 'https://instagram.com', 'social', 'instagram', '#ffffff', 1, 0, 0, 15],
    [userId, 'YouTube', 'https://youtube.com', 'social', 'youtube', '#ffffff', 1, 1, 1, 28],
    [userId, 'Twitter / X', 'https://x.com', 'social', 'twitter', '#ffffff', 1, 0, 2, 12],
    [userId, 'Discord Server', 'https://discord.gg', 'social', 'discord', '#ffffff', 1, 0, 3, 8],
    [userId, 'GitHub', 'https://github.com', 'social', 'github', '#ffffff', 1, 0, 4, 19],
    [userId, 'My Portfolio', 'https://example.com', 'link', 'website', '#ffffff', 1, 1, 5, 33],
    [userId, 'Spotify Playlist', 'https://spotify.com', 'music', 'spotify', '#ffffff', 1, 0, 6, 7],
    [userId, 'Telegram', 'https://t.me', 'social', 'telegram', '#ffffff', 1, 0, 7, 5],
    [userId, 'TikTok', 'https://tiktok.com', 'social', 'tiktok', '#ffffff', 1, 0, 8, 10],
    [userId, 'Steam', 'https://store.steampowered.com', 'social', 'steam', '#ffffff', 1, 0, 9, 3],
  ];

  const insertMany = db.transaction((links) => {
    for (const link of links) insertLink.run(...link);
  });
  insertMany(demoLinks);

  // Create demo badges
  const insertBadge = db.prepare('INSERT INTO badges (user_id, badge_type) VALUES (?, ?)');
  const demoBadges = ['verified', 'early_user', 'creator'];
  for (const badge of demoBadges) {
    insertBadge.run(userId, badge);
  }

  console.log('✓ Demo user created (username: demo, password: demo123)');
  console.log('✓ Demo profile, links, and badges seeded');
  closeDb();
}

seed().catch(err => {
  console.error('Seed error:', err);
  closeDb();
  process.exit(1);
});
