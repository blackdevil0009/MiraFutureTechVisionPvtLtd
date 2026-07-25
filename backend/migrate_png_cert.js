const pool = require('./db');

async function run() {
  try {
    console.log('Migrating intern_certificates for png_url...');
    try { await pool.query('ALTER TABLE intern_certificates ADD COLUMN png_url VARCHAR(500)'); console.log('Added png_url column'); } catch(e) { console.log('png_url column exists:', e.message); }
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    process.exit();
  }
}

run();
