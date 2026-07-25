const pool = require('./db');

async function migrate() {
  try {
    console.log('Running intern attendance & certificate DB migration...');
    try { await pool.query('ALTER TABLE internships ADD COLUMN present_days INT DEFAULT 0'); console.log('Added present_days'); } catch(e) {}
    try { await pool.query('ALTER TABLE internships ADD COLUMN total_days INT DEFAULT 30'); console.log('Added total_days'); } catch(e) {}
    try { await pool.query("ALTER TABLE internships ADD COLUMN certificate_override VARCHAR(50) DEFAULT 'Auto'"); console.log('Added certificate_override'); } catch(e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query("INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES ('mandatory_attendance_threshold', '85')");
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    process.exit();
  }
}

migrate();
