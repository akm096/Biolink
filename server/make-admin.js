const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { getDb, closeDb } = require('./src/db/database');

const username = process.argv[2];

if (!username) {
  console.error('\nLütfen bir kullanıcı adı girin.');
  console.error('Kullanım: node make-admin.js <kullanici_adi>\n');
  process.exit(1);
}

try {
  const db = getDb();
  
  // Kullanıcıyı bul
  const user = db.prepare('SELECT id, username, role FROM users WHERE username = ?').get(username.toLowerCase());
  
  if (!user) {
    console.error(`\nHata: '${username}' adlı kullanıcı bulunamadı.\n`);
    closeDb();
    process.exit(1);
  }
  
  if (user.role === 'admin') {
    console.log(`\nBilgi: '${user.username}' zaten bir yönetici (admin).\n`);
  } else {
    // Admin yap
    db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(user.id);
    console.log(`\n✅ Başarılı: '${user.username}' başarıyla yönetici (admin) yapıldı!\n`);
  }
  
} catch (err) {
  console.error('Veritabanı hatası:', err.message);
} finally {
  closeDb();
}
