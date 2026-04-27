require('dotenv').config();
const app = require('./app');
const { getDb, closeDb } = require('./db/database');

const PORT = process.env.PORT || 8055;

// Initialize database on startup
getDb();
console.log('✓ Database connected');

const server = app.listen(PORT, () => {
  console.log(`✓ BioPlatform API running on http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  closeDb();
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  closeDb();
  server.close(() => process.exit(0));
});
