CREATE TABLE IF NOT EXISTS click_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  visitor_ip TEXT DEFAULT '',
  country TEXT DEFAULT '',
  city TEXT DEFAULT '',
  device_type TEXT DEFAULT 'desktop',
  user_agent TEXT DEFAULT '',
  referrer TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_click_logs_user_id ON click_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_click_logs_link_id ON click_logs(link_id);
CREATE INDEX IF NOT EXISTS idx_click_logs_ip ON click_logs(visitor_ip);
CREATE INDEX IF NOT EXISTS idx_click_logs_created_at ON click_logs(created_at);

ALTER TABLE visit_logs ADD COLUMN device_type TEXT DEFAULT 'desktop';
ALTER TABLE visit_logs ADD COLUMN user_agent TEXT DEFAULT '';
