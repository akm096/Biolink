const USERNAME_REGEX = /^[a-z0-9_.]{3,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^(https?:\/\/|mailto:).+/i;
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const TEMPLATES = [
  template('minimal-dark', 'Minimal Dark', 'Clean and minimal dark theme', '#0a0a0a', '#ffffff'),
  template('neon-purple', 'Neon Purple', 'Vibrant purple neon glow', '#0d0015', '#a855f7'),
  template('cyber-blue', 'Cyber Blue', 'Futuristic cyber blue aesthetic', '#000a14', '#38bdf8'),
  template('red-glow', 'Red Glow', 'Intense red glow effect', '#0f0000', '#ef4444'),
  template('glassmorphism', 'Glassmorphism', 'Frosted glass modern look', '#16213e', '#e2e8f0'),
  template('anime-night', 'Anime Night', 'Dark anime-inspired aesthetic', '#0c0014', '#ec4899'),
  template('clean-creator', 'Clean Creator', 'Professional clean creator look', '#111111', '#f59e0b'),
  template('terminal-hacker', 'Terminal Hacker', 'Matrix-style terminal green', '#000000', '#22c55e'),
  template('soft-gradient', 'Soft Gradient', 'Soft warm gradient tones', '#2d1b4e', '#fbbf24'),
  template('black-luxury', 'Black Luxury', 'Premium black and gold luxury', '#000000', '#d4af37')
];

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return corsResponse(request, env);

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      if (!path.startsWith('/api/')) {
        return json({ error: 'API endpoint not found' }, 404, request, env);
      }

      if (request.method === 'GET' && path === '/api/health') {
        return json({ status: 'ok', runtime: 'cloudflare-worker', timestamp: new Date().toISOString() }, 200, request, env);
      }

      if (request.method === 'POST' && path === '/api/auth/register') return register(request, env);
      if (request.method === 'POST' && path === '/api/auth/login') return login(request, env);
      if (request.method === 'GET' && path === '/api/auth/me') return me(request, env);

      if (request.method === 'GET' && path === '/api/profile/me') return getMyProfile(request, env);
      if (request.method === 'PUT' && path === '/api/profile/me') return updateMyProfile(request, env);
      if (request.method === 'GET' && path.startsWith('/api/profile/check/')) return checkUsername(request, env, decodeSegment(path, 3));
      if (request.method === 'GET' && path.startsWith('/api/profile/')) return getPublicProfile(request, env, decodeSegment(path, 2));

      if (request.method === 'GET' && path === '/api/links') return getLinks(request, env);
      if (request.method === 'POST' && path === '/api/links') return createLink(request, env);
      if (request.method === 'POST' && path === '/api/links/reorder') return reorderLinks(request, env);
      if (request.method === 'POST' && /^\/api\/links\/\d+\/click$/.test(path)) return trackClick(request, env, Number(path.split('/')[3]));
      if (request.method === 'PUT' && /^\/api\/links\/\d+$/.test(path)) return updateLink(request, env, Number(path.split('/')[3]));
      if (request.method === 'DELETE' && /^\/api\/links\/\d+$/.test(path)) return deleteLink(request, env, Number(path.split('/')[3]));

      if (request.method === 'GET' && path === '/api/stats/me') return getStats(request, env);
      if (request.method === 'GET' && path === '/api/templates') return json({ templates: TEMPLATES }, 200, request, env);

      if (request.method === 'GET' && path === '/api/admin/stats') return adminStats(request, env);
      if (request.method === 'GET' && path === '/api/admin/users') return adminUsers(request, env, url.searchParams);
      if (request.method === 'GET' && /^\/api\/admin\/users\/\d+$/.test(path)) return adminUser(request, env, Number(path.split('/')[4]));
      if (request.method === 'PUT' && /^\/api\/admin\/users\/\d+$/.test(path)) return adminUpdateUser(request, env, Number(path.split('/')[4]));
      if (request.method === 'DELETE' && /^\/api\/admin\/users\/\d+$/.test(path)) return adminDeleteUser(request, env, Number(path.split('/')[4]));
      if (request.method === 'GET' && path === '/api/admin/visits') return adminVisits(request, env);

      return json({ error: 'API endpoint not found' }, 404, request, env);
    } catch (error) {
      console.error(error);
      return json({ error: 'Internal server error' }, 500, request, env);
    }
  }
};

async function register(request, env) {
  const body = await readJson(request);
  const username = String(body.username || '').toLowerCase();
  const email = String(body.email || '').toLowerCase();

  const usernameErr = validateUsername(username);
  if (usernameErr) return json({ error: usernameErr }, 400, request, env);
  const emailErr = validateEmail(email);
  if (emailErr) return json({ error: emailErr }, 400, request, env);
  const passwordErr = validatePassword(body.password);
  if (passwordErr) return json({ error: passwordErr }, 400, request, env);

  const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ? OR email = ?').bind(username, email).first();
  if (existing) return json({ error: 'Username or email already taken' }, 409, request, env);

  const passwordHash = await hashPassword(body.password);
  const result = await env.DB.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)').bind(username, email, passwordHash).run();
  const userId = result.meta.last_row_id;

  await env.DB.batch([
    env.DB.prepare('INSERT INTO profiles (user_id, display_name) VALUES (?, ?)').bind(userId, username),
    env.DB.prepare('INSERT INTO badges (user_id, badge_type) VALUES (?, ?)').bind(userId, 'early_user')
  ]);

  const token = await generateToken(userId, env);
  return json({ token, user: { id: userId, username, email } }, 201, request, env);
}

async function login(request, env) {
  const body = await readJson(request);
  const loginValue = String(body.login || '').toLowerCase();
  if (!loginValue || !body.password) return json({ error: 'Username/email and password required' }, 400, request, env);

  const user = await env.DB.prepare('SELECT * FROM users WHERE username = ? OR email = ?').bind(loginValue, loginValue).first();
  if (!user || !(await verifyPassword(body.password, user.password_hash))) {
    return json({ error: 'Invalid credentials' }, 401, request, env);
  }

  await env.DB.prepare('UPDATE users SET last_login_ip = ?, last_login_at = CURRENT_TIMESTAMP WHERE id = ?').bind(getClientIp(request), user.id).run();

  const token = await generateToken(user.id, env);
  return json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } }, 200, request, env);
}

async function me(request, env) {
  const userId = await requireUser(request, env);
  if (userId instanceof Response) return userId;
  const user = await env.DB.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').bind(userId).first();
  if (!user) return json({ error: 'User not found' }, 404, request, env);
  return json({ user }, 200, request, env);
}

async function getMyProfile(request, env) {
  const userId = await requireUser(request, env);
  if (userId instanceof Response) return userId;
  const profile = await profileByUser(env, userId);
  if (!profile) return json({ error: 'Profile not found' }, 404, request, env);
  return json({ profile: { ...profile, badges: await badgesForUser(env, userId) } }, 200, request, env);
}

async function updateMyProfile(request, env) {
  const userId = await requireUser(request, env);
  if (userId instanceof Response) return userId;
  const body = await readJson(request);

  if (body.username !== undefined) {
    const username = String(body.username).toLowerCase();
    const usernameErr = validateUsername(username);
    if (usernameErr) return json({ error: usernameErr }, 400, request, env);
    const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ? AND id != ?').bind(username, userId).first();
    if (existing) return json({ error: 'Username already taken' }, 409, request, env);
    await env.DB.prepare('UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(username, userId).run();
  }

  for (const field of ['avatar_url', 'background_image_url', 'background_video_url', 'music_url']) {
    if (body[field]) {
      const urlErr = validateUrl(body[field]);
      if (urlErr) return json({ error: urlErr }, 400, request, env);
    }
  }

  await env.DB.prepare(`
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
  `).bind(
    optText(body, 'display_name'), optText(body, 'bio'), opt(body, 'avatar_url'), opt(body, 'background_image_url'),
    opt(body, 'background_video_url'), opt(body, 'music_url'), optText(body, 'music_title'), optText(body, 'music_artist'),
    optText(body, 'location'), opt(body, 'template'), opt(body, 'accent_color'), optBool(body, 'show_enter_overlay'),
    optBool(body, 'show_view_count'), optBool(body, 'enable_effects'), userId
  ).run();

  if (Array.isArray(body.badges)) await replaceBadges(env, userId, body.badges);

  const profile = await profileByUser(env, userId);
  return json({ profile: { ...profile, badges: await badgesForUser(env, userId) } }, 200, request, env);
}

async function checkUsername(request, env, username) {
  const userId = await requireUser(request, env);
  if (userId instanceof Response) return userId;
  const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ? AND id != ?').bind(String(username || '').toLowerCase(), userId).first();
  return json({ available: !existing }, 200, request, env);
}

async function getPublicProfile(request, env, username) {
  const user = await env.DB.prepare('SELECT id, username FROM users WHERE username = ?').bind(String(username || '').toLowerCase()).first();
  if (!user) return json({ error: 'User not found' }, 404, request, env);

  const profile = await env.DB.prepare('SELECT * FROM profiles WHERE user_id = ?').bind(user.id).first();
  if (!profile) return json({ error: 'Profile not found' }, 404, request, env);

  await env.DB.prepare('UPDATE profiles SET views = views + 1 WHERE user_id = ?').bind(user.id).run();
  const visitor = getVisitorInfo(request);
  if (visitor.ip) {
    try {
      await env.DB.prepare('INSERT INTO visit_logs (user_id, visitor_ip, country, city, device_type, user_agent) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(user.id, visitor.ip, visitor.country, visitor.city, visitor.deviceType, visitor.userAgent)
        .run();
    } catch {
      await env.DB.prepare('INSERT INTO visit_logs (user_id, visitor_ip, country, city) VALUES (?, ?, ?, ?)')
        .bind(user.id, visitor.ip, visitor.country, visitor.city)
        .run();
    }
  }

  const links = await env.DB.prepare('SELECT id, title, url, type, icon, color, is_visible, is_featured, position, click_count FROM links WHERE user_id = ? AND is_visible = 1 ORDER BY position ASC').bind(user.id).all();

  return json({
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
      views: profile.views + 1,
      created_at: profile.created_at,
      badges: await badgesForUser(env, user.id),
      links: links.results
    }
  }, 200, request, env);
}

async function getLinks(request, env) {
  const userId = await requireUser(request, env);
  if (userId instanceof Response) return userId;
  const links = await env.DB.prepare('SELECT * FROM links WHERE user_id = ? ORDER BY position ASC').bind(userId).all();
  return json({ links: links.results }, 200, request, env);
}

async function createLink(request, env) {
  const userId = await requireUser(request, env);
  if (userId instanceof Response) return userId;
  const body = await readJson(request);
  if (!body.title || !body.url) return json({ error: 'Title and URL are required' }, 400, request, env);
  const normalizedUrl = normalizeLinkUrl(body.url);
  const urlErr = validateUrl(normalizedUrl);
  if (urlErr) return json({ error: urlErr }, 400, request, env);

  const maxPos = await env.DB.prepare('SELECT MAX(position) as max_pos FROM links WHERE user_id = ?').bind(userId).first();
  const position = (maxPos?.max_pos ?? -1) + 1;
  const result = await env.DB.prepare('INSERT INTO links (user_id, title, url, type, icon, color, is_visible, is_featured, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(userId, sanitizeString(body.title), normalizedUrl, body.type || 'link', body.icon || 'link', body.color || '', body.is_visible !== undefined ? boolInt(body.is_visible) : 1, boolInt(body.is_featured), position)
    .run();
  const link = await env.DB.prepare('SELECT * FROM links WHERE id = ?').bind(result.meta.last_row_id).first();
  return json({ link }, 201, request, env);
}

async function updateLink(request, env, id) {
  const userId = await requireUser(request, env);
  if (userId instanceof Response) return userId;
  const link = await env.DB.prepare('SELECT * FROM links WHERE id = ? AND user_id = ?').bind(id, userId).first();
  if (!link) return json({ error: 'Link not found' }, 404, request, env);
  const body = await readJson(request);
  if (body.url) {
    const urlErr = validateUrl(normalizeLinkUrl(body.url));
    if (urlErr) return json({ error: urlErr }, 400, request, env);
  }
  const normalizedUrl = body.url !== undefined ? normalizeLinkUrl(body.url) : null;

  await env.DB.prepare(`
    UPDATE links SET title = COALESCE(?, title), url = COALESCE(?, url), type = COALESCE(?, type),
      icon = COALESCE(?, icon), color = COALESCE(?, color), is_visible = COALESCE(?, is_visible),
      is_featured = COALESCE(?, is_featured), position = COALESCE(?, position), updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).bind(optText(body, 'title'), normalizedUrl, opt(body, 'type'), opt(body, 'icon'), opt(body, 'color'), optBool(body, 'is_visible'), optBool(body, 'is_featured'), opt(body, 'position'), id, userId).run();

  const updated = await env.DB.prepare('SELECT * FROM links WHERE id = ?').bind(id).first();
  return json({ link: updated }, 200, request, env);
}

async function deleteLink(request, env, id) {
  const userId = await requireUser(request, env);
  if (userId instanceof Response) return userId;
  const result = await env.DB.prepare('DELETE FROM links WHERE id = ? AND user_id = ?').bind(id, userId).run();
  if (!result.meta.changes) return json({ error: 'Link not found' }, 404, request, env);
  return json({ success: true }, 200, request, env);
}

async function reorderLinks(request, env) {
  const userId = await requireUser(request, env);
  if (userId instanceof Response) return userId;
  const body = await readJson(request);
  if (!Array.isArray(body.linkIds)) return json({ error: 'linkIds array required' }, 400, request, env);
  await env.DB.batch(body.linkIds.map((id, index) => env.DB.prepare('UPDATE links SET position = ? WHERE id = ? AND user_id = ?').bind(index, id, userId)));
  const links = await env.DB.prepare('SELECT * FROM links WHERE user_id = ? ORDER BY position ASC').bind(userId).all();
  return json({ links: links.results }, 200, request, env);
}

async function trackClick(request, env, id) {
  const link = await env.DB.prepare('SELECT id, user_id FROM links WHERE id = ?').bind(id).first();
  if (!link) return json({ error: 'Link not found' }, 404, request, env);

  const visitor = getVisitorInfo(request);
  await env.DB.prepare('UPDATE links SET click_count = click_count + 1 WHERE id = ?').bind(id).run();
  try {
    await env.DB.prepare('INSERT INTO click_logs (link_id, user_id, visitor_ip, country, city, device_type, user_agent, referrer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(link.id, link.user_id, visitor.ip, visitor.country, visitor.city, visitor.deviceType, visitor.userAgent, visitor.referrer)
      .run();
  } catch {
    // The total click counter should keep working even before the detail migration is applied.
  }
  return json({ success: true }, 200, request, env);
}

async function getStats(request, env) {
  const userId = await requireUser(request, env);
  if (userId instanceof Response) return userId;
  const profile = await env.DB.prepare('SELECT views, created_at, updated_at FROM profiles WHERE user_id = ?').bind(userId).first();
  const linkStats = await env.DB.prepare('SELECT COUNT(*) as total_links, SUM(click_count) as total_clicks FROM links WHERE user_id = ?').bind(userId).first();
  const topLinks = await env.DB.prepare('SELECT title, url, click_count, icon FROM links WHERE user_id = ? ORDER BY click_count DESC LIMIT 5').bind(userId).all();
  const user = await env.DB.prepare('SELECT username FROM users WHERE id = ?').bind(userId).first();
  const clickDetails = await getClickDetails(env, userId);
  return json({
    stats: {
      total_views: profile?.views || 0,
      total_links: linkStats?.total_links || 0,
      total_clicks: linkStats?.total_clicks || 0,
      unique_clickers: clickDetails.unique_clickers,
      mobile_clicks: clickDetails.mobile_clicks,
      desktop_clicks: clickDetails.desktop_clicks,
      device_breakdown: clickDetails.device_breakdown,
      country_breakdown: clickDetails.country_breakdown,
      recent_clicks: clickDetails.recent_clicks,
      top_links: topLinks.results,
      profile_url: `/${user?.username}`,
      created_at: profile?.created_at,
      updated_at: profile?.updated_at
    }
  }, 200, request, env);
}

async function adminStats(request, env) {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;
  const rows = await env.DB.batch([
    env.DB.prepare('SELECT COUNT(*) as count FROM users'),
    env.DB.prepare('SELECT COUNT(*) as count FROM links'),
    env.DB.prepare('SELECT SUM(views) as count FROM profiles'),
    env.DB.prepare('SELECT SUM(click_count) as count FROM links'),
    env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE date(created_at) = date('now')"),
    env.DB.prepare('SELECT COUNT(*) as count FROM visit_logs')
  ]);
  let loggedClicks = 0;
  try {
    const clickRows = await env.DB.prepare('SELECT COUNT(*) as count FROM click_logs').first();
    loggedClicks = clickRows?.count || 0;
  } catch {}
  return json({ stats: { total_users: rows[0].results[0].count, total_links: rows[1].results[0].count, total_views: rows[2].results[0].count || 0, total_clicks: rows[3].results[0].count || 0, new_users_today: rows[4].results[0].count, active_visits: rows[5].results[0].count, logged_clicks: loggedClicks } }, 200, request, env);
}

async function adminUsers(request, env, searchParams) {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;
  const search = searchParams.get('search') || '';
  const sql = `
    SELECT u.id, u.username, u.email, u.role, u.last_login_ip, u.last_login_at, u.created_at,
      p.display_name, p.avatar_url, p.views, p.is_verified,
      (SELECT COUNT(*) FROM links l WHERE l.user_id = u.id) as link_count,
      (SELECT SUM(click_count) FROM links l WHERE l.user_id = u.id) as total_clicks
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    ${search ? 'WHERE u.username LIKE ? OR u.email LIKE ? OR p.display_name LIKE ?' : ''}
    ORDER BY u.created_at DESC`;
  const query = env.DB.prepare(sql);
  const result = search ? await query.bind(`%${search}%`, `%${search}%`, `%${search}%`).all() : await query.all();
  return json({ users: result.results }, 200, request, env);
}

async function adminUser(request, env, userId) {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;
  const user = await env.DB.prepare('SELECT id, username, email, role, last_login_ip, last_login_at, created_at FROM users WHERE id = ?').bind(userId).first();
  if (!user) return json({ error: 'User not found' }, 404, request, env);
  const profile = await env.DB.prepare('SELECT * FROM profiles WHERE user_id = ?').bind(userId).first();
  return json({ user, profile, badges: await badgesForUser(env, userId) }, 200, request, env);
}

async function adminUpdateUser(request, env, userId) {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;
  const body = await readJson(request);
  const existing = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
  if (!existing) return json({ error: 'User not found' }, 404, request, env);

  if (body.username || body.email || body.role) {
    if (body.username) {
      const usernameErr = validateUsername(String(body.username).toLowerCase());
      if (usernameErr) return json({ error: usernameErr }, 400, request, env);
    }
    if (body.email) {
      const emailErr = validateEmail(String(body.email).toLowerCase());
      if (emailErr) return json({ error: emailErr }, 400, request, env);
    }
    const conflict = await env.DB.prepare('SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?').bind(body.username ? String(body.username).toLowerCase() : '', body.email ? String(body.email).toLowerCase() : '', userId).first();
    if (conflict) return json({ error: 'Username or email already taken' }, 409, request, env);
    await env.DB.prepare('UPDATE users SET username = COALESCE(?, username), email = COALESCE(?, email), role = COALESCE(?, role), updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(body.username ? String(body.username).toLowerCase() : null, body.email ? String(body.email).toLowerCase() : null, body.role || null, userId).run();
  }

  await env.DB.prepare('UPDATE profiles SET display_name = COALESCE(?, display_name), bio = COALESCE(?, bio), views = COALESCE(?, views), is_verified = COALESCE(?, is_verified), updated_at = CURRENT_TIMESTAMP WHERE user_id = ?').bind(optText(body, 'display_name'), optText(body, 'bio'), opt(body, 'views'), optBool(body, 'is_verified'), userId).run();
  if (Array.isArray(body.badges)) await replaceBadges(env, userId, body.badges);
  return json({ success: true }, 200, request, env);
}

async function adminDeleteUser(request, env, userId) {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;
  if (String(userId) === String(admin)) return json({ error: 'Cannot delete your own admin account' }, 400, request, env);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM badges WHERE user_id = ?').bind(userId),
    env.DB.prepare('DELETE FROM links WHERE user_id = ?').bind(userId),
    env.DB.prepare('DELETE FROM visit_logs WHERE user_id = ?').bind(userId),
    env.DB.prepare('DELETE FROM profiles WHERE user_id = ?').bind(userId)
  ]);
  const result = await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
  if (!result.meta.changes) return json({ error: 'User not found' }, 404, request, env);
  return json({ success: true, message: 'User deleted successfully' }, 200, request, env);
}

async function adminVisits(request, env) {
  const admin = await requireAdmin(request, env);
  if (admin instanceof Response) return admin;
  const visits = await env.DB.prepare('SELECT v.*, u.username as visited_profile FROM visit_logs v LEFT JOIN users u ON u.id = v.user_id ORDER BY v.created_at DESC LIMIT 100').all();
  return json({ visits: visits.results.map((row) => ({ ...row, country_label: countryName(row.country) })) }, 200, request, env);
}

async function getClickDetails(env, userId) {
  try {
    const rows = await env.DB.batch([
      env.DB.prepare('SELECT COUNT(DISTINCT visitor_ip) as count FROM click_logs WHERE user_id = ? AND visitor_ip != ?').bind(userId, ''),
      env.DB.prepare('SELECT device_type, COUNT(*) as count FROM click_logs WHERE user_id = ? GROUP BY device_type ORDER BY count DESC').bind(userId),
      env.DB.prepare('SELECT country, COUNT(*) as count FROM click_logs WHERE user_id = ? GROUP BY country ORDER BY count DESC LIMIT 10').bind(userId),
      env.DB.prepare(`
        SELECT c.id, c.visitor_ip, c.country, c.city, c.device_type, c.created_at,
          l.title as link_title, l.url as link_url
        FROM click_logs c
        LEFT JOIN links l ON l.id = c.link_id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
        LIMIT 25
      `).bind(userId)
    ]);

    const deviceBreakdown = rows[1].results.map((row) => ({
      device_type: normalizeDevice(row.device_type),
      count: row.count
    }));
    const countryBreakdown = rows[2].results.map((row) => ({
      country: row.country || 'Unknown',
      country_label: countryName(row.country),
      count: row.count
    }));

    return {
      unique_clickers: rows[0].results[0]?.count || 0,
      mobile_clicks: deviceBreakdown.find((row) => row.device_type === 'mobile')?.count || 0,
      desktop_clicks: deviceBreakdown.find((row) => row.device_type === 'desktop')?.count || 0,
      device_breakdown: deviceBreakdown,
      country_breakdown: countryBreakdown,
      recent_clicks: rows[3].results.map((row) => ({
        ...row,
        country_label: countryName(row.country),
        device_type: normalizeDevice(row.device_type)
      }))
    };
  } catch {
    return {
      unique_clickers: 0,
      mobile_clicks: 0,
      desktop_clicks: 0,
      device_breakdown: [],
      country_breakdown: [],
      recent_clicks: []
    };
  }
}

async function profileByUser(env, userId) {
  return env.DB.prepare('SELECT p.*, u.username, u.email FROM profiles p JOIN users u ON u.id = p.user_id WHERE p.user_id = ?').bind(userId).first();
}

async function badgesForUser(env, userId) {
  const rows = await env.DB.prepare('SELECT badge_type FROM badges WHERE user_id = ?').bind(userId).all();
  return rows.results.map((row) => row.badge_type);
}

async function replaceBadges(env, userId, badges) {
  const allowed = new Set(['verified', 'early_user', 'creator', 'developer', 'music', 'gamer']);
  const validBadges = badges.filter((badge) => allowed.has(badge));
  await env.DB.prepare('DELETE FROM badges WHERE user_id = ?').bind(userId).run();
  if (validBadges.length) {
    await env.DB.batch(validBadges.map((badge) => env.DB.prepare('INSERT INTO badges (user_id, badge_type) VALUES (?, ?)').bind(userId, badge)));
  }
}

async function requireAdmin(request, env) {
  const userId = await requireUser(request, env);
  if (userId instanceof Response) return userId;
  const user = await env.DB.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first();
  if (!user || user.role !== 'admin') return json({ error: 'Admin access required' }, 403, request, env);
  return userId;
}

async function requireUser(request, env) {
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Bearer ')) return json({ error: 'Authentication required' }, 401, request, env);
  const payload = await verifyToken(header.slice(7), env);
  if (!payload?.userId) return json({ error: 'Invalid or expired token' }, 401, request, env);
  return payload.userId;
}

async function generateToken(userId, env) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { userId, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS };
  const unsigned = `${base64UrlJson(header)}.${base64UrlJson(payload)}`;
  const signature = await hmac(unsigned, env.JWT_SECRET);
  return `${unsigned}.${signature}`;
}

async function verifyToken(token, env) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const expected = await hmac(`${parts[0]}.${parts[1]}`, env.JWT_SECRET);
  if (expected !== parts[2]) return null;
  const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[1])));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt);
  return `pbkdf2$100000$${bytesToBase64(salt)}$${bytesToBase64(hash)}`;
}

async function verifyPassword(password, stored) {
  const [scheme, iterations, saltB64, hashB64] = String(stored).split('$');
  if (scheme !== 'pbkdf2' || iterations !== '100000') return false;
  const hash = await pbkdf2(password, base64ToBytes(saltB64));
  return bytesToBase64(hash) === hashB64;
}

async function pbkdf2(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000 }, key, 256);
  return new Uint8Array(bits);
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret || 'dev-secret-change-me'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return base64Url(new Uint8Array(sig));
}

function validateUsername(username) {
  if (!username) return 'Username is required';
  if (!USERNAME_REGEX.test(username)) return 'Username must be 3-30 characters: lowercase letters, numbers, underscores, dots only';
  return null;
}

function validateEmail(email) {
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
  return null;
}

function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

function validateUrl(url) {
  if (!url) return null;
  if (!URL_REGEX.test(url)) return 'URL must start with http://, https://, or mailto:';
  return null;
}

function normalizeLinkUrl(value) {
  const trimmed = String(value || '').trim();
  return EMAIL_REGEX.test(trimmed) ? `mailto:${trimmed}` : trimmed;
}

function sanitizeString(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/<script[^>]*>.*?<\/script>/gi, '').replace(/<[^>]+>/g, '').trim();
}

function opt(body, key) {
  return body[key] !== undefined ? body[key] : null;
}

function optText(body, key) {
  return body[key] !== undefined ? sanitizeString(body[key]) : null;
}

function optBool(body, key) {
  return body[key] !== undefined ? boolInt(body[key]) : null;
}

function boolInt(value) {
  return value ? 1 : 0;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function getClientIp(request) {
  return (request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
}

function getVisitorInfo(request) {
  const userAgent = request.headers.get('User-Agent') || '';
  return {
    ip: getClientIp(request),
    country: (request.cf?.country || request.headers.get('CF-IPCountry') || '').toUpperCase(),
    city: request.cf?.city || '',
    deviceType: detectDevice(userAgent),
    userAgent: userAgent.slice(0, 500),
    referrer: (request.headers.get('Referer') || '').slice(0, 500)
  };
}

function detectDevice(userAgent) {
  const ua = String(userAgent || '').toLowerCase();
  if (/ipad|tablet|kindle|silk|playbook/.test(ua)) return 'tablet';
  if (/mobi|android|iphone|ipod|blackberry|phone/.test(ua)) return 'mobile';
  return 'desktop';
}

function normalizeDevice(value) {
  return ['mobile', 'desktop', 'tablet'].includes(value) ? value : 'desktop';
}

function countryName(code) {
  if (!code) return 'Unknown';
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

function decodeSegment(path, index) {
  return decodeURIComponent(path.split('/')[index + 1] || '');
}

function template(id, name, description, bg, accent) {
  return {
    id,
    name,
    description,
    preview: {
      bg,
      card: 'rgba(255,255,255,0.06)',
      accent,
      text: '#ffffff',
      button: 'rgba(255,255,255,0.1)',
      glow: 'none',
      font: "'Inter', sans-serif"
    }
  };
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const configured = env.CLIENT_URL || '';
  const allowOrigin = configured === '*' || !origin || origin === configured || origin.endsWith('.pages.dev') ? (origin || configured || '*') : configured;
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function corsResponse(request, env) {
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}

function json(data, status, request, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(request, env)
    }
  });
}

function base64UrlJson(value) {
  return base64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function base64Url(bytes) {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value) {
  return base64ToBytes(value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4));
}

function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
