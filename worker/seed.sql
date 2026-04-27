INSERT OR IGNORE INTO users (id, username, email, password_hash, role)
VALUES (
  1,
  'demo',
  'demo@example.com',
  'pbkdf2$100000$c2VlZC1kZW1v$Scm6gCBozSJnXGH8M2Vn0XzVp01h3Gg86BiU6yUKdOE=',
  'user'
);

INSERT OR IGNORE INTO profiles (
  user_id, display_name, bio, avatar_url,
  background_image_url, background_video_url,
  music_url, music_title, music_artist,
  location, template, accent_color,
  show_enter_overlay, show_view_count, enable_effects,
  is_verified, views
) VALUES (
  1,
  'Demo User',
  'Welcome to my Cloudflare D1 profile! This is a demo bio-link page.',
  'https://api.dicebear.com/9.x/glass/svg?seed=demo&backgroundColor=a855f7',
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80',
  '',
  '',
  'Chill Vibes',
  'Lo-fi Beats',
  'Internet',
  'neon-purple',
  '#a855f7',
  1, 1, 1, 1, 42
);

INSERT OR IGNORE INTO badges (user_id, badge_type) VALUES
  (1, 'verified'),
  (1, 'early_user'),
  (1, 'creator');

INSERT OR IGNORE INTO links (id, user_id, title, url, type, icon, color, is_visible, is_featured, position, click_count) VALUES
  (1, 1, 'Instagram', 'https://instagram.com', 'social', 'instagram', '#ffffff', 1, 0, 0, 15),
  (2, 1, 'YouTube', 'https://youtube.com', 'social', 'youtube', '#ffffff', 1, 1, 1, 28),
  (3, 1, 'Twitter / X', 'https://x.com', 'social', 'twitter', '#ffffff', 1, 0, 2, 12),
  (4, 1, 'Discord Server', 'https://discord.gg', 'social', 'discord', '#ffffff', 1, 0, 3, 8),
  (5, 1, 'GitHub', 'https://github.com', 'social', 'github', '#ffffff', 1, 0, 4, 19),
  (6, 1, 'My Portfolio', 'https://example.com', 'link', 'website', '#ffffff', 1, 1, 5, 33);
